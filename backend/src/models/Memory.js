const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MemorySchema = new Schema({
  relationshipId: {
    type: Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: false
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String
    },
    size: {
      type: Number,
      required: true
    }
  }],
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
MemorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Memory', MemorySchema);
