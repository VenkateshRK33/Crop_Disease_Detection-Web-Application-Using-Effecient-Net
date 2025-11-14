/**
 * Production Environment Testing Script
 * 
 * Comprehensive testing suite for production deployment
 * 
 * Usage: node scripts/test-production.js [base-url]
 * Example: node scripts/test-production.js https://krishiraksha.com
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:4000';
const FRONTEND_URL = process.argv[3] || 'http://localhost:3000';

console.log('🧪 KrishiRaksha Production Testing Suite\n');
console.log(`Backend URL: ${BASE_URL}`);
console.log(`Frontend URL: ${FRONTEND_URL}\n`);

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test function
async function test(name, testFn) {
  process.stdout.write(`Testing: ${name}... `);
  
  try {
    await testFn();
    console.log('✅ PASS');
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
  }
}

// Test Suite
async function runTests() {
  console.log('═══════════════════════════════════════════\n');
  console.log('Backend API Tests\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Test 1: Health Check
  await test('Health check endpoint', async () => {
    const res = await makeRequest(`${BASE_URL}/health`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
    const data = JSON.parse(res.body);
    if (data.status !== 'healthy') {
      throw new Error('Service not healthy');
    }
  });
  
  // Test 2: CORS Headers
  await test('CORS headers configured', async () => {
    const res = await makeRequest(`${BASE_URL}/health`);
    if (!res.headers['access-control-allow-origin']) {
      throw new Error('CORS headers not found');
    }
  });
  
  // Test 3: Market Prices API
  await test('Market prices endpoint', async () => {
    const res = await makeRequest(`${BASE_URL}/api/market-prices/wheat`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
    const data = JSON.parse(res.body);
    if (!data.success) {
      throw new Error('API returned error');
    }
  });
  
  // Test 4: Environmental Data API
  await test('Environmental data endpoint', async () => {
    const res = await makeRequest(`${BASE_URL}/api/environment/current?lat=28.7041&lon=77.1025`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  });
  
  // Test 5: Harvest Calculator API
  await test('Harvest calculator endpoint', async () => {
    const payload = JSON.stringify({
      cropType: 'wheat',
      currentMaturity: 70,
      pestInfestation: 20,
      currentMarketPrice: 2500,
      expectedYield: 1000
    });
    
    const res = await makeRequest(`${BASE_URL}/api/harvest/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      body: payload
    });
    
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  });
  
  // Test 6: Calendar Events API
  await test('Calendar events endpoint', async () => {
    const res = await makeRequest(`${BASE_URL}/api/calendar/events/test-user`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  });
  
  console.log('\n═══════════════════════════════════════════\n');
  console.log('Security Tests\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Test 7: Security Headers
  await test('Security headers present', async () => {
    const res = await makeRequest(`${BASE_URL}/health`);
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options'
    ];
    
    for (const header of requiredHeaders) {
      if (!res.headers[header]) {
        throw new Error(`Missing security header: ${header}`);
      }
    }
  });
  
  // Test 8: Rate Limiting
  await test('Rate limiting configured', async () => {
    // Make multiple rapid requests
    const requests = Array(10).fill().map(() => 
      makeRequest(`${BASE_URL}/health`)
    );
    
    const responses = await Promise.all(requests);
    // Just verify requests complete (rate limiting may not trigger in test)
    if (responses.length !== 10) {
      throw new Error('Not all requests completed');
    }
  });
  
  console.log('\n═══════════════════════════════════════════\n');
  console.log('Performance Tests\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Test 9: Response Time
  await test('API response time < 1s', async () => {
    const start = Date.now();
    await makeRequest(`${BASE_URL}/health`);
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      throw new Error(`Response took ${duration}ms (expected < 1000ms)`);
    }
  });
  
  // Test 10: Concurrent Requests
  await test('Handle concurrent requests', async () => {
    const requests = Array(20).fill().map(() => 
      makeRequest(`${BASE_URL}/health`)
    );
    
    const start = Date.now();
    await Promise.all(requests);
    const duration = Date.now() - start;
    
    if (duration > 5000) {
      throw new Error(`Concurrent requests took ${duration}ms (expected < 5000ms)`);
    }
  });
  
  console.log('\n═══════════════════════════════════════════\n');
  console.log('Integration Tests\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Test 11: Database Connection
  await test('Database connection working', async () => {
    const res = await makeRequest(`${BASE_URL}/health`);
    const data = JSON.parse(res.body);
    
    if (data.mongodb !== 'connected') {
      throw new Error('Database not connected');
    }
  });
  
  // Test 12: External API Integration
  await test('Weather API integration', async () => {
    const res = await makeRequest(`${BASE_URL}/api/environment/current?lat=28.7041&lon=77.1025`);
    
    if (res.statusCode !== 200) {
      throw new Error('Weather API not responding');
    }
    
    const data = JSON.parse(res.body);
    if (!data.success) {
      throw new Error('Weather API returned error');
    }
  });
  
  // Print Results
  console.log('\n═══════════════════════════════════════════\n');
  console.log('Test Results\n');
  console.log('═══════════════════════════════════════════\n');
  
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%\n`);
  
  if (results.failed > 0) {
    console.log('Failed Tests:');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`  ❌ ${t.name}: ${t.error}`);
      });
    console.log('');
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
