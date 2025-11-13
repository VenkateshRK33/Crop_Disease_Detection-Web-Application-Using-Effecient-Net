const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Mock environment variables
process.env.PORT = 4001; // Use different port for testing
process.env.MONGODB_URI = 'mongodb://localhost:27017/plant-disease-test';
process.env.ML_API_URL = 'http://localhost:5000';
process.env.OLLAMA_URL = 'http://localhost:11434';
process.env.OLLAMA_MODEL = 'minimax-m2:cloud';

// Import server after setting env vars
const app = require('./server');

describe('Backend API Tests', () => {
  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });

    test('should check Ollama connection', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('ollama');
      expect(['connected', 'disconnected']).toContain(response.body.ollama);
    });

    test('should check database connection', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('database');
      expect(['connected', 'disconnected']).toContain(response.body.database);
    });
  });

  describe('POST /api/users', () => {
    test('should create a new user', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        name: 'Test User',
        phone: '1234567890',
        location: 'Test Location'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
    });

    test('should return existing user if email exists', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Existing User'
      };

      // Create user first time
      await request(app)
        .post('/api/users')
        .send(userData);

      // Try to create again
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
    });

    test('should return 500 if email is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test User' })
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/analyze', () => {
    test('should return 400 if no image is provided', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('image');
    });

    test('should handle valid image upload', async () => {
      // Find a test image
      const testImagePath = path.join(__dirname, '..', '0a3d19ca-a126-4ea3-83e3-0abb0e9b02e3___YLCV_GCREC 2449.JPG');
      
      if (!fs.existsSync(testImagePath)) {
        console.log('Test image not found, skipping image upload test');
        return;
      }

      const response = await request(app)
        .post('/api/analyze')
        .attach('image', testImagePath)
        .expect('Content-Type', /json/);

      // Should succeed if ML service is running
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('prediction');
        expect(response.body.prediction).toHaveProperty('disease');
        expect(response.body.prediction).toHaveProperty('confidence');
        expect(response.body).toHaveProperty('conversationId');
      } else {
        // ML service might be down
        expect(response.status).toBe(503);
      }
    }, 30000); // 30 second timeout for ML processing
  });

  describe('GET /api/predictions/:userId', () => {
    test('should handle invalid userId format', async () => {
      const response = await request(app)
        .get('/api/predictions/nonexistent-user-id')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    test('should return empty array for valid userId with no predictions', async () => {
      const validObjectId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/predictions/${validObjectId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.predictions).toEqual([]);
    });
  });

  describe('CORS Configuration', () => {
    test('should allow requests from frontend origin', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      // Express returns HTML for 404 by default, not JSON
      expect(response.status).toBe(404);
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });
});

// Cleanup after tests
afterAll(async () => {
  // Close any open connections
  if (global.mongoConnection) {
    await global.mongoConnection.close();
  }
});
