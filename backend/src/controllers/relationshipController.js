const Relationship = require('../models/Relationship');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all relationships for current user
const getUserRelationships = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find relationships where user is either creator or partner
    const relationships = await Relationship.find({
      $or: [
        { creator: user._id },
        { partner: user._id }
      ]
    }).populate('creator', 'name email')
      .populate('partner', 'name email');
    
    res.json(relationships);
  } catch (error) {
    console.error('Error in getUserRelationships:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new relationship
const createRelationship = async (req, res) => {
  try {
    const { name, type, partnerEmail, frequency, duration, revealTheme } = req.body;
    
    // Validate required fields
    if (!name || !type || !partnerEmail || !frequency || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const creator = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!creator) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if partner exists
    const partner = await User.findOne({ email: partnerEmail });
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found. They need to register first.' });
    }
    
    // Convert duration string to days
    let durationDays;
    switch (duration) {
      case '3 months':
        durationDays = 90;
        break;
      case '6 months':
        durationDays = 180;
        break;
      case '1 year':
        durationDays = 365;
        break;
      default:
        durationDays = parseInt(duration);
    }
    
    // Create new relationship
    const relationship = new Relationship({
      name,
      type,
      creator: creator._id,
      partner: partner._id,
      frequency,
      duration: durationDays,
      revealTheme: revealTheme || 'neutral',
      status: 'Pending'
    });
    
    await relationship.save();
    
    // Create invitation notification for partner
    const notification = new Notification({
      userId: partner._id,
      relationshipId: relationship._id,
      type: 'invitation',
      status: 'pending',
      scheduledFor: new Date()
    });
    
    await notification.save();
    
    // Populate creator and partner info
    await relationship.populate('creator', 'name email');
    await relationship.populate('partner', 'name email');
    
    res.status(201).json(relationship);
  } catch (error) {
    console.error('Error in createRelationship:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get relationship by ID
const getRelationshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const relationship = await Relationship.findById(id)
      .populate('creator', 'name email')
      .populate('partner', 'name email');
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Check if user is part of this relationship
    if (!relationship.creator.equals(user._id) && !relationship.partner.equals(user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this relationship' });
    }
    
    res.json(relationship);
  } catch (error) {
    console.error('Error in getRelationshipById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept relationship invitation
const acceptRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const relationship = await Relationship.findById(id);
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Check if user is the partner
    if (!relationship.partner.equals(user._id)) {
      return res.status(403).json({ message: 'Not authorized to accept this invitation' });
    }
    
    // Check if relationship is pending
    if (relationship.status !== 'Pending') {
      return res.status(400).json({ message: 'Relationship is not in pending state' });
    }
    
    // Update relationship status to Active
    relationship.status = 'Active';
    relationship.startDate = new Date();
    
    // Calculate end date based on duration
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + relationship.duration);
    relationship.endDate = endDate;
    
    await relationship.save();
    
    // Populate creator and partner info
    await relationship.populate('creator', 'name email');
    await relationship.populate('partner', 'name email');
    
    res.json(relationship);
  } catch (error) {
    console.error('Error in acceptRelationship:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete relationship
const deleteRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const relationship = await Relationship.findById(id);
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // Check if user is part of this relationship
    if (!relationship.creator.equals(user._id) && !relationship.partner.equals(user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this relationship' });
    }
    
    // Update relationship status to Deleted
    relationship.status = 'Deleted';
    await relationship.save();
    
    res.json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRelationship:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserRelationships,
  createRelationship,
  getRelationshipById,
  acceptRelationship,
  deleteRelationship
};
