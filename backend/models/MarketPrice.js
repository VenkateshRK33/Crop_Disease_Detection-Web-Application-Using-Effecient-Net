/**
 * MarketPrice Model
 * Stores crop market price information across different markets
 */

const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  
  market: {
    type: String,
    required: [true, 'Market name is required'],
    trim: true
  },
  
  location: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lon: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  unit: {
    type: String,
    default: 'quintal',
    enum: ['quintal', 'kg', 'ton']
  },
  
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD']
  },
  
  source: {
    type: String,
    trim: true,
    default: 'Manual Entry'
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient queries
marketPriceSchema.index({ crop: 1, timestamp: -1 });
marketPriceSchema.index({ market: 1, crop: 1 });
marketPriceSchema.index({ 'location.city': 1, crop: 1 });

// Static method to get latest prices for a crop
marketPriceSchema.statics.getLatestPrices = function(cropName, limit = 10) {
  return this.find({ crop: cropName.toLowerCase() })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('-__v');
};

// Static method to get price history for a crop
marketPriceSchema.statics.getPriceHistory = function(cropName, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    crop: cropName.toLowerCase(),
    timestamp: { $gte: startDate }
  })
    .sort({ timestamp: 1 })
    .select('-__v');
};

// Static method to get average price by market
marketPriceSchema.statics.getAveragePriceByMarket = async function(cropName) {
  return this.aggregate([
    {
      $match: { crop: cropName.toLowerCase() }
    },
    {
      $group: {
        _id: '$market',
        avgPrice: { $avg: '$price' },
        latestPrice: { $last: '$price' },
        lastUpdated: { $last: '$timestamp' },
        location: { $last: '$location' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
};

// Static method to get price trend (daily average)
marketPriceSchema.statics.getPriceTrend = async function(cropName, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        crop: cropName.toLowerCase(),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        date: '$_id',
        avgPrice: { $round: ['$avgPrice', 2] },
        minPrice: 1,
        maxPrice: 1,
        _id: 0
      }
    }
  ]);
};

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
