const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const exportController = require('../controllers/exportController');

// All routes are protected
router.use(verifyToken);

// Request a new export (PDF or video)
router.post('/relationship/:relationshipId', exportController.requestExport);

// Get exports for a relationship
router.get('/relationship/:relationshipId', exportController.getRelationshipExports);

// Update export status (would be called by background worker in real implementation)
router.put('/:exportId/status', exportController.updateExportStatus);

module.exports = router;
