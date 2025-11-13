/**
 * Prediction Model
 * Stores disease detection results from ML model
 */

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous predictions
  },
  
  imagePath: {
    type: String,
    required: [true, 'Image path is required']
  },
  
  disease: {
    type: String,
    required: [true, 'Disease name is required'],
    trim: true
  },
  
  confidence: {
    type: Number,
    required: [true, 'Confidence score is required'],
    min: [0, 'Confidence cannot be less than 0'],
    max: [1, 'Confidence cannot be more than 1']
  },
  
  topPredictions: [{
    class: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  }],
  
  cropType: {
    type: String,
    enum: ['Tomato', 'Potato', 'Pepper', 'Unknown'],
    default: 'Unknown'
  },
  
  imageMetadata: {
    size: Number,
    format: String,
    width: Number,
    height: Number
  },
  
  mlModelVersion: {
    type: String,
    default: '1.0'
  },
  
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for associated conversation
predictionSchema.virtual('conversation', {
  ref: 'Conversation',
  localField: '_id',
  foreignField: 'predictionId',
  justOne: true
});

// Index for faster queries
predictionSchema.index({ userId: 1, timestamp: -1 });
predictionSchema.index({ disease: 1 });
predictionSchema.index({ timestamp: -1 });

// Method to get confidence percentage
predictionSchema.methods.getConfidencePercentage = function() {
  return (this.confidence * 100).toFixed(2);
};

// Static method to get user's prediction history
predictionSchema.statics.getUserHistory = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('-__v');
};

// Static method to get disease statistics
predictionSchema.statics.getDiseaseStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$disease',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('Prediction', predictionSchema);
