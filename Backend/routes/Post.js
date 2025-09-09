const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.js');
const { createPost, getAllPosts } = require('../controllers/postController.js');

// Get all posts (public)
router.get('/', getAllPosts);

// Create a post (requires login)
router.post('/', authenticateToken, createPost);

module.exports = router;


