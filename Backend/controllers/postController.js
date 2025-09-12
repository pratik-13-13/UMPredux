const { cloudinary } = require('../middlewares/upload.js');
const { Post } = require('../models/Post.js');
const { User } = require('../models/User.js');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let imageUrl = null;

    // If image was uploaded via multer
    if (req.file) {
      if (req.file.path) {
        // Cloudinary URL
        imageUrl = req.file.path;
      } else {
        // Memory storage - for now just indicate file was received
        imageUrl = `File uploaded: ${req.file.originalname}`;
        console.log('File received but no cloud storage configured');
      }
    }
    // If image URL was provided directly
    else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const post = await Post.create({
      userId: req.user._id,
      content: content.trim(),
      image: imageUrl,
    });

    const populated = await post.populate({ path: 'userId', select: 'name email' });
    return res.status(201).json(populated);
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Server error: ' + error.message }); // Show actual error
  }
};


// Delete post 
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Find the post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user owns the post (only owner can delete)
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    // Delete the post
    await Post.findByIdAndDelete(postId);
    
    console.log(`Post deleted successfully: ${postId} by user ${req.user._id}`);
    
    return res.json({ 
      message: 'Post deleted successfully',
      postId: postId 
    });
    
  } catch (error) {
    console.error('Delete post error:', error);
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
  deletePost,
  getAllPosts,
  toggleLike,
  addComment,
  deleteComment,
  editComment
};
