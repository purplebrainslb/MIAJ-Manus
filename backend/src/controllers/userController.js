const User = require('../models/User');
const { createOrGetUser } = require('../services/authService');

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register or login user from Firebase auth
const authUser = async (req, res) => {
  try {
    // Firebase user data is in req.user from the verifyToken middleware
    const user = await createOrGetUser(req.user);
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error in authUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.name = name;
    await user.save();
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCurrentUser,
  authUser,
  updateUser
};
