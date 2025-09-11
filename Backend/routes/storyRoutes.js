const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.js');
const { upload } = require('../middlewares/upload.js');
const {
  createStory,
  getActiveStories,
  getStoriesByUser,
  viewStory,
  deleteStory
} = require('../controllers/storyController.js');

// Get all active stories
router.get('/', getActiveStories);

// Get stories grouped by user
router.get('/by-user', getStoriesByUser);

// Create a story (requires login)
router.post('/', authenticateToken, upload.single('image'), createStory);

// View a story (requires login)
router.post('/:storyId/view', authenticateToken, viewStory);

// Delete a story (requires login)
router.delete('/:storyId', authenticateToken, deleteStory);

module.exports = router;
