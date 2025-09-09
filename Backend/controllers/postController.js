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
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'comments.userId', select: 'name email' });
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Toggle like on a post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user._id;
    const hasLiked = post.likes.some((id) => id.toString() === userId.toString());
    if (hasLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }
    await post.save();
    const populated = await Post.findById(postId)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'comments.userId', select: 'name email' });
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Comment text required' });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.comments.push({ userId: req.user._id, text: text.trim() });
    await post.save();
    const populated = await Post.findById(postId)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'comments.userId', select: 'name email' });
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Delete a comment
// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // Convert both IDs to strings for comparison
    const userId = req.user._id.toString();
    const commentUserId = comment.userId.toString();
    const postUserId = post.userId.toString();

    const isOwner = commentUserId === userId;
    const isPostOwner = postUserId === userId;

    if (!isOwner && !isPostOwner && req.user.role !== 'admin') {
      console.log('Delete comment unauthorized:', {
        commentUserId,
        userId,
        postUserId,
        isOwner,
        isPostOwner,
        userRole: req.user.role
      });
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Use pull() instead of remove()
    post.comments.pull(commentId);
    await post.save();

    const populated = await Post.findById(postId)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'comments.userId', select: 'name email' });

    return res.json(populated);
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};


// Edit a comment
const editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // Convert both IDs to strings for comparison
    const userId = req.user._id.toString();
    const commentUserId = comment.userId.toString();

    if (commentUserId !== userId && req.user.role !== 'admin') {
      console.log('Edit comment unauthorized:', {
        commentUserId,
        userId,
        userRole: req.user.role
      });
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    comment.text = text.trim();
    comment.updatedAt = new Date();

    await post.save();

    const populated = await Post.findById(postId)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'comments.userId', select: 'name email' });

    return res.json(populated);
  } catch (error) {
    console.error('Edit comment error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  toggleLike,
  addComment,
  deleteComment,
  editComment
};
