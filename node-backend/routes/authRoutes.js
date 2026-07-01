const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private (Requires token)
router.get('/profile', authMiddleware, authController.getProfile);

// @route   GET /api/auth/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);

// @route   PUT /api/auth/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', authMiddleware, adminMiddleware, authController.updateUserRole);

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', authMiddleware, adminMiddleware, authController.deleteUser);

module.exports = router;
