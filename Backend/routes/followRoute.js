const express = require('express');
const { 
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getSuggestions,
  getFollowStatus,
  getBatchFollowStatus,
  // NEW: Follow request functions
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,
  getFollowRequests
} = require('../controllers/followController');
const {authenticateToken}  = require('../middlewares/auth');

const router = express.Router();

// Existing routes - keep as is
router.post('/follow/:userId', authenticateToken, followUser);
router.delete('/unfollow/:userId', authenticateToken, unfollowUser);
router.get('/followers/:userId', authenticateToken, getFollowers);
router.get('/following/:userId', authenticateToken, getFollowing);
router.get('/suggestions', authenticateToken, getSuggestions);
router.get('/status/:userId', authenticateToken, getFollowStatus);
router.post('/batch-status', authenticateToken, getBatchFollowStatus);

// NEW: Follow request routes
router.post('/request/:userId', authenticateToken, sendFollowRequest);
router.post('/accept/:userId', authenticateToken, acceptFollowRequest);
router.post('/reject/:userId', authenticateToken, rejectFollowRequest);
router.delete('/cancel/:userId', authenticateToken, cancelFollowRequest);
router.get('/requests', authenticateToken, getFollowRequests);

module.exports = router;
