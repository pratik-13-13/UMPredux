const { Story } = require('../models/Story.js');
const { User } = require('../models/User.js');

// ✅ FIXED: Create story with proper URL handling
const createStory = async (req, res) => {
  try {
    const { content } = req.body;
    
    let imageUrl = null;
    
    if (req.file) {
      if (req.file.path && req.file.path.includes('cloudinary.com')) {
        // ✅ CLOUDINARY: Use cloudinary URL directly
        imageUrl = req.file.path;
      } else if (req.file.filename) {
        // ✅ FIXED: Create proper HTTP URL for local storage
        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost:5000';
        imageUrl = `${protocol}://${host}/uploads/stories/${req.file.filename}`;
      }
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Story image is required' });
    }

    // console.log('✅ Creating story with image URL:', imageUrl);

    const story = await Story.create({
      userId: req.user._id,
      content: content?.trim() || '',
      image: imageUrl,
    });

    const populated = await story.populate({ 
      path: 'userId', 
      select: 'name email' 
    });
    
    return res.status(201).json(populated);
  } catch (error) {
    console.error('Create story error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all active stories (not expired)
const getActiveStories = async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .populate({ path: 'userId', select: 'name email' })
    .populate({ path: 'viewers', select: 'name email' });
    
    return res.json(stories);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get stories grouped by user
const getStoriesByUser = async (req, res) => {
  try {
    const stories = await Story.aggregate([
      { $match: { expiresAt: { $gt: new Date() } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          stories: { $push: "$$ROOT" },
          latestStory: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id", 
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: {
            _id: "$userInfo._id",
            name: "$userInfo.name",
            email: "$userInfo.email"
          },
          stories: 1,
          latestStory: 1
        }
      },
      { $sort: { 'latestStory.createdAt': -1 } }
    ]);

    // ✅ ENHANCED: Populate viewers with full data including profilePic
    await Story.populate(stories, [
      { path: 'stories.viewers.userId', select: 'name email profilePic' },
      { path: 'latestStory.viewers.userId', select: 'name email profilePic' }
    ]);
    
    return res.json(stories);
  } catch (error) {
    console.error('Get stories by user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};


// ✅ ENHANCED: Instagram-like viewStory controller
const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Check if story is expired
    if (story.expiresAt < new Date()) {
      return res.status(404).json({ error: 'Story has expired' });
    }
    
    const userId = req.user._id;
    
    // Don't count views for own stories
    if (story.userId.toString() === userId.toString()) {
      const populated = await Story.findById(storyId)
        .populate({ path: 'userId', select: 'name email profilePic' })
        .populate({ path: 'viewers.userId', select: 'name email profilePic' });
        
      return res.json({
        success: true,
        story: populated,
        viewCount: populated.viewCount || populated.viewers.length,
        hasViewed: false,
        isOwnStory: true
      });
    }
    
    // Check if user already viewed (prevent duplicates)
    const hasViewed = story.viewers.some(viewer => 
      viewer.userId ? viewer.userId.toString() === userId.toString() : viewer.toString() === userId.toString()
    );
    
    if (!hasViewed) {
      // Add new viewer with timestamp
      story.viewers.push({
        userId: userId,
        viewedAt: new Date()
      });
      story.viewCount = (story.viewCount || 0) + 1;
      await story.save();
    }
    
    const populated = await Story.findById(storyId)
      .populate({ path: 'userId', select: 'name email profilePic' })
      .populate({ path: 'viewers.userId', select: 'name email profilePic' });
      
    return res.json({
      success: true,
      story: populated,
      viewCount: populated.viewCount || populated.viewers.length,
      hasViewed: true,
      isOwnStory: false
    });
  } catch (error) {
    console.error('View story error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};


// Get story viewers (for the story owner) - Instagram style
const getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId)
      .populate({ path: 'viewers.userId', select: 'name email profilePic' });
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Only story owner can see viewers
    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Sort viewers by most recent first
    const sortedViewers = story.viewers
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
      .map(viewer => ({
        user: viewer.userId,
        viewedAt: viewer.viewedAt
      }));
    
    return res.json({
      storyId: story._id,
      viewerCount: story.viewCount || story.viewers.length,
      viewers: sortedViewers
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ ENHANCED: Delete story
const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    if (story.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      //console.log(`Unauthorized delete attempt: User ${req.user._id} tried to delete story ${storyId} owned by ${story.userId}`);
      return res.status(403).json({ error: 'Not authorized to delete this story' });
    }
    
    // Delete the story
    await Story.findByIdAndDelete(storyId);
    
    //console.log(`Story deleted successfully: ${storyId} by user ${req.user._id}`);
    return res.json({ 
      message: 'Story deleted successfully',
      storyId: storyId
    });
    
  } catch (error) {
    console.error('Delete story error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ NEW: Mark user stories as seen (Instagram-like)
const markStoriesAsSeen = async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user._id;
    
    // Don't mark own stories as seen
    if (userId === viewerId.toString()) {
      return res.json({ message: 'Cannot mark own stories as seen' });
    }
    
    // Find all active stories from this user
    const stories = await Story.find({
      userId: userId,
      expiresAt: { $gt: new Date() },
      isActive: true
    });
    
    let markedCount = 0;
    
    for (let story of stories) {
      // Check if already viewed
      const hasViewed = story.viewers.some(viewer => 
        viewer.userId ? viewer.userId.toString() === viewerId.toString() : viewer.toString() === viewerId.toString()
      );
      
      if (!hasViewed) {
        story.viewers.push({
          userId: viewerId,
          viewedAt: new Date()
        });
        story.viewCount = (story.viewCount || 0) + 1;
        await story.save();
        markedCount++;
      }
    }
    
    return res.json({ 
      message: `Marked ${markedCount} stories as seen`,
      markedCount
    });
  } catch (error) {
    console.error('Mark stories as seen error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ UPDATED: Clean duplicate viewers utility function
const cleanDuplicateViewers = async (req, res) => {
  try {
    const stories = await Story.find({});
    let cleanedCount = 0;
    
    for (let story of stories) {
      const originalCount = story.viewers.length;
      
      // Handle both old and new viewer formats
      const uniqueViewers = story.viewers.filter((viewer, index, self) => {
        const viewerId = viewer.userId ? viewer.userId.toString() : viewer.toString();
        return index === self.findIndex(v => {
          const vId = v.userId ? v.userId.toString() : v.toString();
          return vId === viewerId;
        });
      });
      
      if (uniqueViewers.length !== originalCount) {
        story.viewers = uniqueViewers;
        story.viewCount = uniqueViewers.length;
        await story.save();
        cleanedCount++;
      }
    }
    
    return res.json({ 
      message: 'Duplicate viewers cleaned successfully',
      storiesCleaned: cleanedCount
    });
  } catch (error) {
    console.error('Clean duplicates error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

//  Clean old file path stories
const cleanOldFilePaths = async (req, res) => {
  try {
    const stories = await Story.find({});
    let cleanedCount = 0;
    
    for (let story of stories) {
      // Check if image path is an absolute file path
      if (story.image && (story.image.startsWith('D:\\') || story.image.startsWith('C:\\') || story.image.includes('backend\\uploads'))) {
        //console.log(`🗑️ Deleting story with invalid path: ${story.image}`);
        await Story.findByIdAndDelete(story._id);
        cleanedCount++;
      }
    }
    
    return res.json({ 
      message: `Cleaned ${cleanedCount} stories with invalid file paths`,
      cleanedCount 
    });
  } catch (error) {
    //console.error('Clean old file paths error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  createStory,
  getActiveStories,
  getStoriesByUser,
  viewStory,
  deleteStory,
  getStoryViewers,
  markStoriesAsSeen,
  cleanDuplicateViewers,
  cleanOldFilePaths 
};



