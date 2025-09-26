const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.js');
const { postUpload } = require('../middlewares/upload.js');
const {
    createPost,
    deletePost,
    getAllPosts,
    toggleLike,
    addComment,
    deleteComment,
    editComment,

} = require('../controllers/postController.js');

router.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  console.log('📄 Request body:', req.body);
  console.log('📁 Request file:', req.file ? 'File present' : 'No file');
  console.log('👤 User:', req.user ? req.user._id : 'No user');
  next();
});

// Get all posts (public)
router.get('/', getAllPosts);

// Create a post with optional image upload (requires login)
router.post('/', 
  authenticateToken, 
  (req, res, next) => {
    console.log('🔍 BEFORE UPLOAD - Body:', req.body);
    console.log('🔍 BEFORE UPLOAD - Files:', req.files);
    next();
  },
  postUpload.single('image'),
  (req, res, next) => {
    console.log('🔍 AFTER UPLOAD - Body:', req.body);
    console.log('🔍 AFTER UPLOAD - File:', req.file);
    next();
  },
  createPost
);

// Delete a post (requires login)
router.delete('/:postId', authenticateToken, deletePost);

// Toggle like (requires login)
router.post('/:postId/like', authenticateToken, toggleLike);

// Add comment (requires login)
router.post('/:postId/comments', authenticateToken, addComment);

// Delete comment (requires login)
router.delete('/:postId/comments/:commentId', authenticateToken, deleteComment);

// Edit comment (requires login)
router.put('/:postId/comments/:commentId', authenticateToken, editComment);

module.exports = router;
