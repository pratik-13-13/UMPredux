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
  markStoriesAsSeen,
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

// Migration route (run once to update existing stories)
router.get('/admin/migrate-viewers', authenticateToken, async (req, res) => {
  try {
    const migrateStoryViewers = require('../migrations/updateStoryViewers.js');
    await migrateStoryViewers();
    res.json({ message: 'Story viewers migration completed successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed' });
  }
}); 


// Create a story (requires login)
router.post('/', authenticateToken, upload.single('image'), createStory);

// View a story (requires login)
router.post('/:storyId/view', authenticateToken, viewStory);

// Mark all stories from a user as seen (Instagram-like)
router.post('/user/:userId/mark-seen', authenticateToken, markStoriesAsSeen);

// Delete a story (requires login)
router.delete('/:storyId', authenticateToken, deleteStory);

module.exports = router;
