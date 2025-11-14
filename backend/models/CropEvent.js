const mongoose = require('mongoose');

/**
 * CropEvent Schema
 * Stores crop calendar events for farmers
 */
const cropEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for demo purposes
  },
  cropType: {
    type: String,
    required: true,
    trim: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['planting', 'irrigation', 'fertilizer', 'pesticide', 'harvest', 'other'],
    default: 'other'
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  completed: {
    type: Boolean,
    default: false
  },
  reminder: {
    type: Boolean,
    default: true
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

// Index for efficient queries
cropEventSchema.index({ userId: 1, date: 1 });
cropEventSchema.index({ date: 1 });
cropEventSchema.index({ eventType: 1 });

// Update the updatedAt timestamp before saving
cropEventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CropEvent = mongoose.model('CropEvent', cropEventSchema);

module.exports = CropEvent;
