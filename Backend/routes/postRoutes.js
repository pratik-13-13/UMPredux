const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.js');
const { upload } = require('../middlewares/upload.js');
const {
    createPost,
    deletePost,
    getAllPosts,
    toggleLike,
    addComment,
    deleteComment,
    editComment,

} = require('../controllers/postController.js');

// Get all posts (public)
router.get('/', getAllPosts);

// Create a post with optional image upload (requires login)
router.post('/', authenticateToken, upload.single('image'), createPost);

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
