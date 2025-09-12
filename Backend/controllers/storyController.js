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

    // ✅ CRITICAL: Populate viewers with full data
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


// ✅ OPTIONAL: Enhanced viewStory controller
const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const userId = req.user._id;
    
    // ✅ OPTIONAL: Don't count views for own stories
    if (story.userId.toString() === userId.toString()) {
      //console.log(`🚫 User ${userId} viewing own story ${storyId} - not counting view`);
      
      const populated = await Story.findById(storyId)
        .populate({ path: 'userId', select: 'name email' })
        .populate({ path: 'viewers', select: 'name email' });
        
      return res.json({
        success: true,
        story: populated,
        viewCount: populated.viewers.length,
        hasViewed: false,
        isOwnStory: true
      });
    }
    
    // Check if user already viewed (prevent duplicates)
    const hasViewed = story.viewers.some(viewerId => 
      viewerId.toString() === userId.toString()
    );
    
    if (!hasViewed) {
      story.viewers.push(userId);
      await story.save();
      //console.log(`✅ User ${userId} viewed story ${storyId} for the first time`);
    } else {
      //console.log(`📝 User ${userId} already viewed story ${storyId}`);
    }
    
    const populated = await Story.findById(storyId)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'viewers', select: 'name email' });
      
    return res.json({
      success: true,
      story: populated,
      viewCount: populated.viewers.length,
      hasViewed: true,
      isOwnStory: false
    });
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

// ✅ ADDED: Clean duplicate viewers utility function
const cleanDuplicateViewers = async (req, res) => {
  try {
    const stories = await Story.find({});
    let cleanedCount = 0;
    
    for (let story of stories) {
      const originalCount = story.viewers.length;
      const uniqueViewers = [...new Set(story.viewers.map(v => v.toString()))];
      
      if (uniqueViewers.length !== originalCount) {
        story.viewers = uniqueViewers;
        await story.save();
        cleanedCount++;
        //console.log(`Cleaned duplicates for story ${story._id}: ${originalCount} -> ${uniqueViewers.length}`);
      }
    }
    
    return res.json({ 
      message: 'Duplicate viewers cleaned successfully',
      storiesCleaned: cleanedCount
    });
  } catch (error) {
    //console.error('Clean duplicates error:', error);
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
  cleanDuplicateViewers,
  cleanOldFilePaths 
};



