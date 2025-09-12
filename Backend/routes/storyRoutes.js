const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.js');
const { upload } = require('../middlewares/upload.js');
const {
  createStory,
  getActiveStories,
  getStoriesByUser,
  viewStory,
  deleteStory,
  getStoryViewers,
  cleanDuplicateViewers,
  cleanOldFilePaths  
} = require('../controllers/storyController.js');

// Get all active stories
router.get('/', getActiveStories);

// Get stories grouped by user
router.get('/by-user', getStoriesByUser);

// Get story viewers (requires login and ownership)
router.get('/:storyId/viewers', authenticateToken, getStoryViewers);

//  ADMIN ROUTES
router.get('/admin/clean-duplicates', authenticateToken, cleanDuplicateViewers);
router.get('/admin/clean-old-paths', authenticateToken, cleanOldFilePaths); 


// Create a story (requires login)
router.post('/', authenticateToken, upload.single('image'), createStory);

// View a story (requires login)
router.post('/:storyId/view', authenticateToken, viewStory);

// Delete a story (requires login)
router.delete('/:storyId', authenticateToken, deleteStory);

module.exports = router;
