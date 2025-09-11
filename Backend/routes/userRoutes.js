const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middlewares/auth.js');

const {
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    registerUser,
    loginUser,
    getCurrentUser
} = require('../controllers/userController.js');

// Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getCurrentUser);
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.post('/', authenticateToken, requireAdmin, addUser);
router.put('/:id', authenticateToken, updateUser);
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);



module.exports = router;

