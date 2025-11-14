/**
 * Environmental Data Model
 * Stores historical environmental data for trends and analysis
 */

const mongoose = require('mongoose');

const EnvironmentalDataSchema = new mongoose.Schema({
  location: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lon: {
        type: Number,
        required: true
      }
    }
  },
  weather: {
    condition: {
      type: String,
      required: true
    },
    temperature: {
      type: Number,
      required: true
    },
    humidity: {
      type: Number,
      required: true
    },
    windSpeed: {
      type: Number
    }
  },
  aqi: {
    type: Number
  },
  soilMoisture: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries by location and date
EnvironmentalDataSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lon': 1, timestamp: -1 });

// Static method to get historical data for a location
EnvironmentalDataSchema.statics.getHistoricalData = async function(lat, lon, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    'location.coordinates.lat': { $gte: lat - 0.1, $lte: lat + 0.1 },
    'location.coordinates.lon': { $gte: lon - 0.1, $lte: lon + 0.1 },
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: 1 })
  .select('-__v');
};

// Static method to save environmental data
EnvironmentalDataSchema.statics.saveData = async function(locationData, weatherData, aqi) {
  return this.create({
    location: {
      name: locationData.name,
      coordinates: {
        lat: locationData.lat,
        lon: locationData.lon
      }
    },
    weather: {
      condition: weatherData.weather,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed
    },
    aqi: aqi
  });
};

// Instance method to format for frontend
EnvironmentalDataSchema.methods.toFrontend = function() {
  return {
    location: this.location.name,
    coordinates: this.location.coordinates,
    weather: this.weather.condition,
    temperature: this.weather.temperature,
    humidity: this.weather.humidity,
    windSpeed: this.weather.windSpeed,
    aqi: this.aqi,
    soilMoisture: this.soilMoisture,
    timestamp: this.timestamp
  };
};

module.exports = mongoose.model('EnvironmentalData', EnvironmentalDataSchema);
