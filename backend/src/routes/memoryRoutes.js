const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const memoryController = require('../controllers/memoryController');

// All routes are protected
router.use(verifyToken);

// Get memories for a relationship (only if relationship is completed)
router.get('/relationship/:relationshipId', memoryController.getRelationshipMemories);

// Add a new memory
router.post('/relationship/:relationshipId', memoryController.addMemory);

module.exports = router;
