const Memory = require('../models/Memory');
const Relationship = require('../models/Relationship');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
    }
  }
}).array('attachments', 5); // Allow up to 5 attachments

// Get memories for a relationship (only if relationship is completed)
const getRelationshipMemories = async (req, res) => {
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
      return res.status(403).json({ message: 'Not authorized to access this relationship' });
    }
    
    // Only allow access to memories if relationship is completed
    if (relationship.status !== 'Completed') {
      return res.status(403).json({ message: 'Memories are only available after the relationship is completed' });
    }
    
    const memories = await Memory.find({ relationshipId })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });
    
    res.json(memories);
  } catch (error) {
    console.error('Error in getRelationshipMemories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new memory
const addMemory = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      const { relationshipId } = req.params;
      const { text } = req.body;
      const files = req.files || [];
      
      // Validate that either text or attachments are provided
      if (!text && files.length === 0) {
        return res.status(400).json({ message: 'Either text or attachments are required' });
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
        return res.status(403).json({ message: 'Not authorized to add memories to this relationship' });
      }
      
      // Check if relationship is active
      if (relationship.status !== 'Active') {
        return res.status(400).json({ message: 'Can only add memories to active relationships' });
      }
      
      // Process attachments
      const attachments = files.map(file => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' :
                        file.mimetype.startsWith('video/') ? 'video' : 'audio';
        
        return {
          type: fileType,
          url: `/uploads/${file.filename}`,
          size: file.size
        };
      });
      
      // Create new memory
      const memory = new Memory({
        relationshipId,
        userId: user._id,
        text,
        attachments
      });
      
      await memory.save();
      
      // Populate user info
      await memory.populate('userId', 'name email');
      
      res.status(201).json(memory);
    });
  } catch (error) {
    console.error('Error in addMemory:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRelationshipMemories,
  addMemory
};
