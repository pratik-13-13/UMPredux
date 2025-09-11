const { Story } = require('../models/Story.js');
const { User } = require('../models/User.js');

// Create a new story
const createStory = async (req, res) => {
  try {
    const { content } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Story image is required' });
    }

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
          _id: '$userId',
          stories: { $push: '$$ROOT' },
          latestStory: { $first: '$$ROOT' }
        }
      },
      { $sort: { 'latestStory.createdAt': -1 } }
    ]);

    await Story.populate(stories, [
      { path: '_id', select: 'name email' },
      { path: 'stories.viewers', select: 'name email' }
    ]);

    return res.json(stories);
  } catch (error) {
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
    
    // Add user to viewers if not already viewed
    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }
    
    const populated = await Story.findById(storyId)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'viewers', select: 'name email' });
      
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Delete story
const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Check if user owns the story
    if (story.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this story' });
    }
    
    await Story.findByIdAndDelete(storyId);
    return res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createStory,
  getActiveStories,
  getStoriesByUser,
  viewStory,
  deleteStory
};
