const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { validateRequired, validateEmail, validatePassword, validateEnum } = require('../middleware/validation');

// @route   POST /api/v1/auth/register
// @desc    Register a user
// @access  Public
router.post('/register',
  validateRequired(['name', 'email', 'password']),
  validateEmail,
  validatePassword,
  authController.register
);

// @route   POST /api/v1/auth/login
// @desc    Login a user
// @access  Public
router.post('/login',
  validateRequired(['email', 'password']),
  validateEmail,
  authController.login
);

// @route   GET /api/v1/auth/profile
// @desc    Get user profile
// @access  Private (Requires token)
router.get('/profile', authMiddleware, authController.getProfile);

// @route   GET /api/v1/auth/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);

// @route   PUT /api/v1/auth/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role',
  authMiddleware,
  adminMiddleware,
  validateRequired(['role']),
  validateEnum('role', ['customer', 'admin']),
  authController.updateUserRole
);

// @route   DELETE /api/v1/auth/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', authMiddleware, adminMiddleware, authController.deleteUser);

module.exports = router;
