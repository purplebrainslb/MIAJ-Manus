const Notification = require('../models/Notification');
const Relationship = require('../models/Relationship');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure nodemailer (in production, use actual SMTP service)
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password'
  }
});

// Get notifications for current user
const getUserNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const notifications = await Notification.find({ userId: user._id })
      .populate('relationshipId', 'name type')
      .sort({ scheduledFor: -1 });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to user
    if (!notification.userId.equals(user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this notification' });
    }
    
    notification.status = 'read';
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send email notification (would be called by background worker in real implementation)
const sendEmailNotification = async (notification) => {
  try {
    const user = await User.findById(notification.userId);
    const relationship = await Relationship.findById(notification.relationshipId);
    
    if (!user || !relationship) {
      console.error('User or relationship not found for notification:', notification._id);
      return;
    }
    
    let subject, text;
    
    switch (notification.type) {
      case 'reminder':
        subject = `Memory Reminder: ${relationship.name}`;
        text = `It's time to add a memory to your "${relationship.name}" relationship. Log in to Memory in a Jar to add your memory.`;
        break;
      case 'reveal':
        subject = `Memories Revealed: ${relationship.name}`;
        text = `Your memories for "${relationship.name}" are now available to view! Log in to Memory in a Jar to see all the memories you've collected.`;
        break;
      case 'invitation':
        subject = `Relationship Invitation: ${relationship.name}`;
        text = `You've been invited to join "${relationship.name}" on Memory in a Jar. Log in to accept the invitation and start collecting memories together.`;
        break;
      default:
        subject = `Memory in a Jar Notification`;
        text = `You have a new notification on Memory in a Jar.`;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@memoryinajar.com',
      to: user.email,
      subject,
      text
    };
    
    // In development, log instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('Email notification:', mailOptions);
      notification.status = 'sent';
      await notification.save();
      return;
    }
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Update notification status
    notification.status = 'sent';
    await notification.save();
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

// Create memory reminder notification
const createMemoryReminder = async (req, res) => {
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
      return res.status(403).json({ message: 'Not authorized to create reminders for this relationship' });
    }
    
    // Create reminder notification
    const notification = new Notification({
      userId: user._id,
      relationshipId,
      type: 'reminder',
      status: 'pending',
      scheduledFor: new Date()
    });
    
    await notification.save();
    
    // In a real implementation, this would be handled by a background job
    // For now, we'll just call the function directly
    await sendEmailNotification(notification);
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error in createMemoryReminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  createMemoryReminder,
  sendEmailNotification
};
