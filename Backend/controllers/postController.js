const { Post } = require('../models/Post.js');
const { User } = require('../models/User.js');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const post = await Post.create({
      userId: req.user._id,
      content: content.trim(),
      image: image || null,
    });

    const populated = await post.populate({ path: 'userId', select: 'name email' });
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all posts, newest first
const getAllPosts = async (_req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'name email' });
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createPost, getAllPosts };


