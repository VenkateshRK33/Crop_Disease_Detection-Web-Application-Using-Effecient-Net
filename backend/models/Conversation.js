/**
 * Conversation Model
 * Stores chatbot conversations with farmers
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous conversations
  },
  
  predictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction',
    required: true
  },
  
  diseaseContext: {
    diseaseName: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    cropType: {
      type: String,
      required: true
    },
    topPredictions: [{
      class: String,
      confidence: Number
    }]
  },
  
  messages: [messageSchema],
  
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot be more than 500 characters']
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update lastActivity on message add
conversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = Date.now();
  }
  next();
});

// Index for faster queries
conversationSchema.index({ userId: 1, lastActivity: -1 });
conversationSchema.index({ predictionId: 1 });
conversationSchema.index({ status: 1 });

// Method to add message
conversationSchema.methods.addMessage = function(role, content) {
  this.messages.push({
    role,
    content,
    timestamp: new Date()
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to get recent messages
conversationSchema.methods.getRecentMessages = function(limit = 4) {
  return this.messages.slice(-limit);
};

// Method to complete conversation
conversationSchema.methods.complete = function(rating, feedback) {
  this.status = 'completed';
  if (rating) this.rating = rating;
  if (feedback) this.feedback = feedback;
  return this.save();
};

// Static method to get active conversations
conversationSchema.statics.getActiveConversations = function(userId) {
  return this.find({ userId, status: 'active' })
    .sort({ lastActivity: -1 })
    .populate('predictionId')
    .select('-__v');
};

// Static method to get conversation statistics
conversationSchema.statics.getStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgMessages: { $avg: { $size: '$messages' } },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
};

// Auto-archive old inactive conversations (30 days)
conversationSchema.statics.archiveOldConversations = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  return this.updateMany(
    {
      status: 'active',
      lastActivity: { $lt: thirtyDaysAgo }
    },
    {
      $set: { status: 'archived' }
    }
  );
};

module.exports = mongoose.model('Conversation', conversationSchema);
