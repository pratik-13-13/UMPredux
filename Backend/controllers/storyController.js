const { Story } = require('../models/Story.js');
const { User } = require('../models/User.js');

// Create a new story
const createStory = async (req, res) => {
  try {
    const { content } = req.body;
    
    let imageUrl = null;
    
    if (req.file) {
      if (req.file.path) {
        // ✅ CLOUDINARY: Use secure_url or path
        imageUrl = req.file.path;
      } else if (req.file.filename) {
        // ✅ LOCAL STORAGE: Create HTTP URL instead of file path
        imageUrl = `/uploads/stories/${req.file.filename}`;
      }
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Story image is required' });
    }

    console.log('✅ Creating story with image URL:', imageUrl);

    const story = await Story.create({
      userId: req.user._id,
      content: content?.trim() || '',
      image: imageUrl, // ✅ Now saves "/uploads/stories/filename.jpg" instead of full path
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
          _id: "$userId", // Group by userId ObjectId
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
//Populate viewers for each story
    await Story.populate(stories, [
      { path: 'stories.viewers', select: 'name email' },
      { path: 'latestStory.viewers', select: 'name email' }
    ]);
    
    return res.json(stories);
  } catch (error) {
    console.error('Get stories by user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// View a story (add current user to viewers)
const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const userId = req.user._id;
    
    // Add user to viewers if not already viewed (avoid duplicates)
    if (!story.viewers.some(viewerId => viewerId.toString() === userId.toString())) {
      story.viewers.push(userId);
      await story.save();
    }
    
    // Return story with populated viewers
    const populated = await Story.findById(storyId)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'viewers', select: 'name email' });
      
    return res.json(populated);
  } catch (error) {
    console.error('View story error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get story viewers (for the story owner)
const getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId)
      .populate({ path: 'viewers', select: 'name email' });
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Only story owner can see viewers
    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    return res.json({
      storyId: story._id,
      viewerCount: story.viewers.length,
      viewers: story.viewers
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ ENHANCED: Delete story with better error handling and logging
const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    
    // Find story first
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // ✅ ENHANCED: Check ownership with detailed logging
    if (story.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log(`Unauthorized delete attempt: User ${req.user._id} tried to delete story ${storyId} owned by ${story.userId}`);
      return res.status(403).json({ error: 'Not authorized to delete this story' });
    }
    
    // ✅ ENHANCED: Optional - Delete associated cloudinary image
    if (story.image && story.image.includes('cloudinary.com')) {
      try {
        const { cloudinary } = require('../middlewares/upload.js');
        const publicId = story.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`posts/${publicId}`);
        console.log(`Deleted cloudinary image: ${publicId}`);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
        // Continue with story deletion even if image deletion fails
      }
    }
    
    // Delete the story
    await Story.findByIdAndDelete(storyId);
    
    console.log(`Story deleted successfully: ${storyId} by user ${req.user._id}`);
    return res.json({ 
      message: 'Story deleted successfully',
      storyId: storyId // ✅ ADDED: Return deleted story ID for frontend state management
    });
    
  } catch (error) {
    console.error('Delete story error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createStory,
  getActiveStories,
  getStoriesByUser,
  viewStory,
  deleteStory,
  getStoryViewers 
};
