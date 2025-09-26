const { cloudinary } = require('../middlewares/upload.js');
const { Post } = require('../models/Post.js');

// Create a new post
const createPost = async (req, res) => {
  try {
    console.log('🎯 CREATE POST START');
    console.log('📝 Request body:', req.body);
    console.log('📁 Request file:', req.file);
    console.log('👤 Request user:', req.user);

    const { content } = req.body;
    const userId = req.user._id;

    if (!userId) {
      console.log('❌ No user ID found');
      return res.status(401).json({ error: 'User authentication failed' });
    }

    if (!content || content.trim() === '') {
      console.log('❌ No content provided');
      return res.status(400).json({ error: 'Post content is required' });
    }

    let imageUrl = null;

    if (req.file) {
      if (cloudinary && req.file.path) {
        imageUrl = req.file.path;
        console.log('☁️ Using Cloudinary URL:', imageUrl);
      } else {
        imageUrl = `/uploads/posts/${req.file.filename}`;
        console.log('💾 Using local URL:', imageUrl);
      }
    }

    console.log('💾 Creating post object...');
    const post = new Post({
      userId,
      content: content.trim(),
      image: imageUrl,
      likes: [],
      comments: []
    });

    console.log('💾 Saving to database...');
    await post.save();
    console.log('✅ Post saved successfully');

    console.log('👤 Populating user data...');
    await post.populate('userId', 'name email profilePic');
    console.log('✅ User data populated');

    res.status(201).json(post);

  } catch (error) {
    console.error('❌ CREATE POST ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    // ✅ FIXED: Send proper JSON error (not HTML)
    const errorMessage = error.message || 'Failed to create post';
    const errorResponse = {
      success: false,
      message: errorMessage,
      error: errorMessage
    };

    console.log('📤 Sending error response:', errorResponse);
    res.status(500).json(errorResponse);
  }
};



// ✅ FIXED: Update all populate calls
const getAllPosts = async (_req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'name email profilePic' })  // ✅ FIXED
      .populate({ path: 'comments.userId', select: 'name email profilePic' }); // ✅ FIXED
    return res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};



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
      .populate({ path: 'userId', select: 'name email profilePic' })
      .populate({ path: 'comments.userId', select: 'name email profilePic' });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};



const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text required' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ userId: req.user._id, text: text.trim() });
    await post.save();

    const populated = await Post.findById(postId)
      .populate({ path: 'userId', select: 'name email profilePic' })
      .populate({ path: 'comments.userId', select: 'name email profilePic' });

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};



const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const userId = req.user._id.toString();
    const commentUserId = comment.userId.toString();
    const postUserId = post.userId.toString();

    const isOwner = commentUserId === userId;
    const isPostOwner = postUserId === userId;

    if (!isOwner && !isPostOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    post.comments.pull(commentId);
    await post.save();

    const populated = await Post.findById(postId)
      .populate({ path: 'userId', select: 'name email profilePic' })
      .populate({ path: 'comments.userId', select: 'name email profilePic' });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

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

    const userId = req.user._id.toString();
    const commentUserId = comment.userId.toString();

    if (commentUserId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    comment.text = text.trim();
    comment.updatedAt = new Date();
    await post.save();

    const populated = await Post.findById(postId)
      .populate({ path: 'userId', select: 'name email profilePic' })
      .populate({ path: 'comments.userId', select: 'name email profilePic' });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ FIXED: Delete post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(postId);

    return res.json({
      message: 'Post deleted successfully',
      postId: postId
    });

  } catch (error) {
    console.error('Delete post error:', error);
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
