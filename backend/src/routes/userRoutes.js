const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Public routes
router.post('/auth', verifyToken, userController.authUser);

// Protected routes
router.get('/me', verifyToken, userController.getCurrentUser);
router.put('/me', verifyToken, userController.updateUser);

module.exports = router;
