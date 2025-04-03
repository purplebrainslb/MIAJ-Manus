const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const relationshipController = require('../controllers/relationshipController');

// All routes are protected
router.use(verifyToken);

// Get all relationships for current user
router.get('/', relationshipController.getUserRelationships);

// Create new relationship
router.post('/', relationshipController.createRelationship);

// Get relationship by ID
router.get('/:id', relationshipController.getRelationshipById);

// Accept relationship invitation
router.put('/:id/accept', relationshipController.acceptRelationship);

// Delete relationship
router.delete('/:id', relationshipController.deleteRelationship);

module.exports = router;
