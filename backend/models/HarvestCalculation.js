/**
 * Harvest Calculation Model
 * Stores user harvest calculations for history and analysis
 */

const mongoose = require('mongoose');

const HarvestCalculationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  cropType: {
    type: String,
    required: true
  },
  inputs: {
    currentMaturity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    pestInfestation: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    currentMarketPrice: {
      type: Number,
      required: true,
      min: 0
    },
    expectedYield: {
      type: Number,
      required: true,
      min: 0
    },
    growthRate: {
      type: Number,
      default: 2.0 // % per day
    },
    pestDamageRate: {
      type: Number,
      default: 1.5 // % per day
    }
  },
  result: {
    optimalDate: {
      type: Date,
      required: true
    },
    optimalDays: {
      type: Number,
      required: true
    },
    expectedProfit: {
      type: Number,
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    scenarios: [{
      days: Number,
      date: Date,
      maturity: Number,
      pestDamage: Number,
      effectiveYield: Number,
      profit: Number
    }]
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
HarvestCalculationSchema.index({ userId: 1, timestamp: -1 });
HarvestCalculationSchema.index({ cropType: 1, timestamp: -1 });

// Static method to get user's calculation history
HarvestCalculationSchema.statics.getUserHistory = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('-__v');
};

// Static method to get recent calculations for a crop
HarvestCalculationSchema.statics.getRecentByCrop = async function(cropType, limit = 5) {
  return this.find({ cropType })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('inputs.currentMarketPrice result.optimalDays result.expectedProfit timestamp -_id');
};

// Instance method to format for frontend
HarvestCalculationSchema.methods.toFrontend = function() {
  return {
    id: this._id,
    cropType: this.cropType,
    inputs: this.inputs,
    result: {
      optimalDate: this.result.optimalDate,
      optimalDays: this.result.optimalDays,
      expectedProfit: this.result.expectedProfit,
      confidence: this.result.confidence,
      scenarios: this.result.scenarios
    },
    timestamp: this.timestamp
  };
};

module.exports = mongoose.model('HarvestCalculation', HarvestCalculationSchema);
