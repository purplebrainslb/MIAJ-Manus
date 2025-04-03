const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All routes are protected
router.use(verifyToken);

// Get notifications for current user
router.get('/', notificationController.getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markNotificationAsRead);

// Create memory reminder notification
router.post('/reminder/relationship/:relationshipId', notificationController.createMemoryReminder);

module.exports = router;
