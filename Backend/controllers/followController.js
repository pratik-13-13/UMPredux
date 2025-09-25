const {User} = require('../models/User');

// Follow a user (existing - keep as is)
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Can't follow yourself
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Find both users
    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Initialize arrays if they don't exist
    if (!userToFollow.followRequests) userToFollow.followRequests = [];
    if (!currentUser.sentRequests) currentUser.sentRequests = [];

    // Check if request already sent
    const alreadySent = userToFollow.followRequests.some(req => req.user.toString() === currentUserId.toString());
    if (alreadySent) {
      return res.status(400).json({ message: "Follow request already sent", status: "requested" });
    }

    // ALWAYS SEND REQUEST (Instagram style - even for public accounts)
    userToFollow.followRequests.push({ user: currentUserId });
    currentUser.sentRequests.push({ user: userId });
    
    await Promise.all([
      userToFollow.save(),
      currentUser.save()
    ]);

    res.status(200).json({ 
      message: "Follow request sent",
      status: "requested"
    });

  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Unfollow a user (existing - keep as is)
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Find both users
    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if actually following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Remove from following and followers lists
    currentUser.following.pull(userId);
    currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
    
    userToUnfollow.followers.pull(currentUserId);
    userToUnfollow.followerCount = Math.max(0, userToUnfollow.followerCount - 1);

    // Save both users
    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ 
      message: "User unfollowed successfully",
      followingCount: currentUser.followingCount,
      followerCount: userToUnfollow.followerCount
    });

  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ FIXED: Send follow request (ONLY this function was broken)
const sendFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // ✅ FIXED: Properly define and find the users
    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize arrays if they don't exist
    if (!targetUser.followRequests) targetUser.followRequests = [];
    if (!currentUser.sentRequests) currentUser.sentRequests = [];

    // Check if request already sent
    const alreadySent = targetUser.followRequests.some(req => req.user.toString() === currentUserId.toString());
    if (alreadySent) {
      return res.status(400).json({ message: "Follow request already sent", status: "requested" });
    }

    // Add follow request
    targetUser.followRequests.push({ user: currentUserId });
    currentUser.sentRequests.push({ user: userId });
    
    await Promise.all([
      targetUser.save(),
      currentUser.save()
    ]);

    // Emit WebSocket event (clean way)
    if (req.io) {
      req.io.to(userId).emit('newFollowRequest', {
        from: {
          _id: currentUserId,
          name: currentUser.name,
          email: currentUser.email
        },
        message: `${currentUser.name} sent you a follow request`,
        timestamp: new Date()
      });
    }

    res.json({ message: "Follow request sent", status: "requested" });
  } catch (error) {
    console.error('Send follow request error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Accept follow request
const acceptFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const followerUser = await User.findById(userId);

    if (!followerUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.followRequests) currentUser.followRequests = [];
    if (!currentUser.followers) currentUser.followers = [];
    if (!followerUser.sentRequests) followerUser.sentRequests = [];
    if (!followerUser.following) followerUser.following = [];

    // Check if request exists
    const requestIndex = currentUser.followRequests.findIndex(req => req.user.toString() === userId);
    if (requestIndex === -1) {
      return res.status(400).json({ message: "No follow request from this user" });
    }

    // Remove from requests and add to followers/following
    currentUser.followRequests.splice(requestIndex, 1);
    currentUser.followers.push(userId);
    // FIX: Update follower count
    currentUser.followerCount = (currentUser.followerCount || 0) + 1;

    const sentRequestIndex = followerUser.sentRequests.findIndex(req => req.user.toString() === currentUserId.toString());
    if (sentRequestIndex !== -1) {
      followerUser.sentRequests.splice(sentRequestIndex, 1);
    }
    followerUser.following.push(currentUserId);
    // FIX: Update following count
    followerUser.followingCount = (followerUser.followingCount || 0) + 1;

    await Promise.all([
      currentUser.save(),
      followerUser.save()
    ]);

    res.json({ 
      message: "Follow request accepted",
      followerCount: currentUser.followerCount,
      followingCount: followerUser.followingCount
    });
  } catch (error) {
    console.error('Accept follow request error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Reject follow request
const rejectFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const followerUser = await User.findById(userId);

    if (!followerUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.followRequests) currentUser.followRequests = [];
    if (!followerUser.sentRequests) followerUser.sentRequests = [];

    // Remove from requests
    const requestIndex = currentUser.followRequests.findIndex(req => req.user.toString() === userId);
    if (requestIndex === -1) {
      return res.status(400).json({ message: "No follow request from this user" });
    }

    currentUser.followRequests.splice(requestIndex, 1);

    const sentRequestIndex = followerUser.sentRequests.findIndex(req => req.user.toString() === currentUserId.toString());
    if (sentRequestIndex !== -1) {
      followerUser.sentRequests.splice(sentRequestIndex, 1);
    }

    await Promise.all([
      currentUser.save(),
      followerUser.save()
    ]);

    res.json({ message: "Follow request rejected" });
  } catch (error) {
    console.error('Reject follow request error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Cancel follow request
const cancelFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize arrays if they don't exist
    if (!targetUser.followRequests) targetUser.followRequests = [];
    if (!currentUser.sentRequests) currentUser.sentRequests = [];

    // Remove from both users
    const requestIndex = targetUser.followRequests.findIndex(req => req.user.toString() === currentUserId.toString());
    if (requestIndex !== -1) {
      targetUser.followRequests.splice(requestIndex, 1);
    }

    const sentRequestIndex = currentUser.sentRequests.findIndex(req => req.user.toString() === userId);
    if (sentRequestIndex !== -1) {
      currentUser.sentRequests.splice(sentRequestIndex, 1);
    }

    await Promise.all([
      targetUser.save(),
      currentUser.save()
    ]);

    res.json({ message: "Follow request cancelled" });
  } catch (error) {
    console.error('Cancel follow request error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW: Get follow requests
const getFollowRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;
   
    const user = await User.findById(currentUserId)
      .populate({
        path: 'followRequests.user',
        select: 'name email profilePicture'
      })
      .select('followRequests name');
    const requests = user?.followRequests || [];
    
    res.json({ 
      requests: requests,
      count: requests.length,
      userName: user?.name
    });

  } catch (error) {
    console.error('Get follow requests error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get followers list (existing - keep as is)
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'name profilePic followerCount followingCount',
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit)
        }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      followers: user.followers,
      totalCount: user.followerCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(user.followerCount / parseInt(limit))
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get following list (existing - keep as is)
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'name profilePic followerCount followingCount',
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit)
        }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      following: user.following,
      totalCount: user.followingCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(user.followingCount / parseInt(limit))
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get follow suggestions (existing - keep as is)
const getSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { limit = 10 } = req.query;

    const currentUser = await User.findById(currentUserId);
    
    // Get users that current user is NOT following
    const suggestions = await User.find({
      _id: { 
        $ne: currentUserId,
        $nin: currentUser.following
      }
    })
    .select('name profilePic followerCount followingCount')
    .sort({ followerCount: -1 }) // Sort by popularity
    .limit(parseInt(limit));

    res.status(200).json({ suggestions });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check follow status between users (existing - keep as is)
const getFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.json({ status: "self" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followRequests) targetUser.followRequests = [];

    const isFollowing = currentUser.following.includes(userId);
    const hasRequested = targetUser.followRequests.some(req => req.user.toString() === currentUserId.toString());
    const isFollowedBy = currentUser.followers && currentUser.followers.includes(userId);

    let status = "follow";
    if (isFollowing) status = "following";
    else if (hasRequested) status = "requested";

    res.status(200).json({
      status,
      isFollowing,        // Does current user follow this person?
      isFollowedBy,       // Does this person follow current user?
      isMutualFollow: isFollowing && isFollowedBy // Both follow each other?
    });
  } catch (error) {
    console.error('Follow status error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Batch follow status (existing - keep as is)
const getBatchFollowStatus = async (req, res) => {
  try {
    const { userIds } = req.body;
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    
    const statuses = {};
    userIds.forEach(userId => {
      statuses[userId] = {
        isFollowing: currentUser.following.includes(userId),
        isFollowedBy: currentUser.followers.includes(userId),
        isMutualFollow: currentUser.following.includes(userId) && currentUser.followers.includes(userId)
      };
    });
    
    res.status(200).json(statuses);
  } catch (error) {
    console.error('Batch follow status error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getSuggestions,
  getFollowStatus,
  getBatchFollowStatus,
  // NEW: Follow request functions
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,
  getFollowRequests
};
