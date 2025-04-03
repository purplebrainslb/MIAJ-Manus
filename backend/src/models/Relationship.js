const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RelationshipSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    required: true
  },
  duration: {
    type: Number, // in days
    required: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  revealTheme: {
    type: String,
    default: 'neutral'
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed', 'Deleted'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
RelationshipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Relationship', RelationshipSchema);
