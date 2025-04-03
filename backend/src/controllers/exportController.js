const Export = require('../models/Export');
const Relationship = require('../models/Relationship');
const Memory = require('../models/Memory');
const User = require('../models/User');

// Request a new export (PDF or video)
const requestExport = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { type } = req.body;
    
    // Validate export type
    if (!type || !['pdf', 'video'].includes(type)) {
      return res.status(400).json({ message: 'Invalid export type. Must be "pdf" or "video".' });
    }
    
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const relationship = await Relationship.findById(relationshipId);
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Check if user is part of this relationship
    if (!relationship.creator.equals(user._id) && !relationship.partner.equals(user._id)) {
      return res.status(403).json({ message: 'Not authorized to request exports for this relationship' });
    }
    
    // Check if relationship is completed
    if (relationship.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only request exports for completed relationships' });
    }
    
    // Create new export request
    const exportRequest = new Export({
      relationshipId,
      userId: user._id,
      type,
      status: 'pending'
    });
    
    await exportRequest.save();
    
    // In a real implementation, this would trigger a background job to generate the export
    // For now, we'll just return the export request
    
    res.status(201).json(exportRequest);
  } catch (error) {
    console.error('Error in requestExport:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get exports for a relationship
const getRelationshipExports = async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const relationship = await Relationship.findById(relationshipId);
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Check if user is part of this relationship
    if (!relationship.creator.equals(user._id) && !relationship.partner.equals(user._id)) {
      return res.status(403).json({ message: 'Not authorized to access exports for this relationship' });
    }
    
    // Get exports for this relationship and user
    const exports = await Export.find({
      relationshipId,
      userId: user._id
    }).sort({ createdAt: -1 });
    
    res.json(exports);
  } catch (error) {
    console.error('Error in getRelationshipExports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update export status (would be called by background worker in real implementation)
const updateExportStatus = async (req, res) => {
  try {
    const { exportId } = req.params;
    const { status, url, expiresAt } = req.body;
    
    // Validate status
    if (!status || !['processing', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const exportDoc = await Export.findById(exportId);
    
    if (!exportDoc) {
      return res.status(404).json({ message: 'Export not found' });
    }
    
    // Update export
    exportDoc.status = status;
    
    if (status === 'completed') {
      if (!url) {
        return res.status(400).json({ message: 'URL is required for completed exports' });
      }
      
      exportDoc.url = url;
      
      // Set expiration date (30 days from now)
      const expDate = expiresAt || new Date();
      expDate.setDate(expDate.getDate() + 30);
      exportDoc.expiresAt = expDate;
    }
    
    await exportDoc.save();
    
    res.json(exportDoc);
  } catch (error) {
    console.error('Error in updateExportStatus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  requestExport,
  getRelationshipExports,
  updateExportStatus
};
