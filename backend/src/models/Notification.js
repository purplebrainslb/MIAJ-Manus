const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationshipId: {
    type: Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true
  },
  type: {
    type: String,
    enum: ['reminder', 'reveal', 'invitation'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'read'],
    default: 'pending'
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
