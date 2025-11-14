const request = require('supertest');
const mongoose = require('mongoose');

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';
process.env.PORT = 4001;

const app = require('./server');

describe('Integration Tests - API Endpoints', () => {
  
  describe('Market Prices API', () => {
    test('GET /api/market-prices returns market data', async () => {
      const response = await request(app)
        .get('/api/market-prices')
        .query({ crop: 'wheat' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/market-prices handles invalid crop', async () => {
      const response = await request(app)
        .get('/api/market-prices')
        .query({ crop: 'invalid_crop_xyz' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Environmental Data API', () => {
    test('GET /api/environment returns weather data', async () => {
      const response = await request(app)
        .get('/api/environment')
        .query({ lat: 28.7041, lon: 77.1025 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    test('GET /api/environment requires coordinates', async () => {
      const response = await request(app)
        .get('/api/environment');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Harvest Calculator API', () => {
    test('POST /api/harvest/calculate returns optimal harvest time', async () => {
      const response = await request(app)
        .post('/api/harvest/calculate')
        .send({
          cropType: 'wheat',
          currentMaturity: 70,
          pestInfestation: 15,
          currentMarketPrice: 2500,
          expectedYield: 50
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('optimalDays');
      expect(response.body).toHaveProperty('expectedProfit');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('scenarios');
      expect(response.body.scenarios).toHaveLength(31);
    });

    test('POST /api/harvest/calculate validates required fields', async () => {
      const response = await request(app)
        .post('/api/harvest/calculate')
        .send({
          cropType: 'wheat'
          // Missing required fields
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('POST /api/harvest/calculate validates maturity range', async () => {
      const response = await request(app)
        .post('/api/harvest/calculate')
        .send({
          cropType: 'wheat',
          currentMaturity: 150, // Invalid: > 100
          pestInfestation: 15,
          currentMarketPrice: 2500,
          expectedYield: 50
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Crop Calendar API', () => {
    test('GET /api/calendar/events returns calendar events', async () => {
      const response = await request(app)
        .get('/api/calendar/events');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('events');
      expect(Array.isArray(response.body.events)).toBe(true);
    });

    test('GET /api/calendar/events/upcoming returns upcoming events', async () => {
      const response = await request(app)
        .get('/api/calendar/events/upcoming')
        .query({ days: 30 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('events');
    });

    test('POST /api/calendar/events creates new event', async () => {
      const newEvent = {
        title: 'Test Planting',
        description: 'Plant wheat seeds',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        eventType: 'planting',
        cropType: 'wheat'
      };

      const response = await request(app)
        .post('/api/calendar/events')
        .send(newEvent);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.event).toHaveProperty('_id');
      expect(response.body.event.title).toBe(newEvent.title);
    });

    test('PUT /api/calendar/events/:id updates event', async () => {
      // First create an event
      const createResponse = await request(app)
        .post('/api/calendar/events')
        .send({
          title: 'Original Title',
          date: new Date().toISOString(),
          eventType: 'planting',
          cropType: 'rice'
        });

      const eventId = createResponse.body.event._id;

      // Then update it
      const updateResponse = await request(app)
        .put(`/api/calendar/events/${eventId}`)
        .send({
          title: 'Updated Title',
          completed: true
        });
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.event.title).toBe('Updated Title');
      expect(updateResponse.body.event.completed).toBe(true);
    });

    test('DELETE /api/calendar/events/:id deletes event', async () => {
      // First create an event
      const createResponse = await request(app)
        .post('/api/calendar/events')
        .send({
          title: 'To Delete',
          date: new Date().toISOString(),
          eventType: 'planting',
          cropType: 'wheat'
        });

      const eventId = createResponse.body.event._id;

      // Then delete it
      const deleteResponse = await request(app)
        .delete(`/api/calendar/events/${eventId}`);
      
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('Health Check API', () => {
    test('GET /api/health returns service status', async () => {
      const response = await request(app)
        .get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('Data Flow Integration', () => {
    test('Complete harvest calculation workflow', async () => {
      // Step 1: Calculate optimal harvest time
      const calcResponse = await request(app)
        .post('/api/harvest/calculate')
        .send({
          cropType: 'wheat',
          currentMaturity: 60,
          pestInfestation: 10,
          currentMarketPrice: 2500,
          expectedYield: 50
        });
      
      expect(calcResponse.status).toBe(200);
      expect(calcResponse.body.success).toBe(true);
      
      const optimalDays = calcResponse.body.optimalDays;
      const optimalDate = new Date(calcResponse.body.optimalDate);
      
      // Step 2: Create calendar event for optimal harvest date
      const eventResponse = await request(app)
        .post('/api/calendar/events')
        .send({
          title: `Harvest Wheat - Optimal Time`,
          description: `Harvest in ${optimalDays} days for maximum profit`,
          date: optimalDate.toISOString(),
          eventType: 'harvesting',
          cropType: 'wheat'
        });
      
      expect(eventResponse.status).toBe(201);
      expect(eventResponse.body.success).toBe(true);
      expect(eventResponse.body.event.eventType).toBe('harvesting');
    });

    test('Market prices to harvest calculation workflow', async () => {
      // Step 1: Get current market prices
      const priceResponse = await request(app)
        .get('/api/market-prices')
        .query({ crop: 'wheat' });
      
      expect(priceResponse.status).toBe(200);
      
      // Step 2: Use market price in harvest calculation
      const currentPrice = priceResponse.body.data?.currentPrice || 2500;
      
      const calcResponse = await request(app)
        .post('/api/harvest/calculate')
        .send({
          cropType: 'wheat',
          currentMaturity: 75,
          pestInfestation: 20,
          currentMarketPrice: currentPrice,
          expectedYield: 45
        });
      
      expect(calcResponse.status).toBe(200);
      expect(calcResponse.body.success).toBe(true);
      expect(calcResponse.body.expectedProfit).toBeGreaterThan(0);
    });
  });
});
