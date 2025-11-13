/**
 * Test Backend API Enhancements
 * Tests the enhanced endpoints from task 6
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:4000';

async function testHealthCheck() {
  console.log('\n=== Testing Health Check Endpoint ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✓ Health check successful');
    console.log('Status:', response.data.status);
    console.log('Ollama:', response.data.ollama);
    console.log('Database:', response.data.database);
    console.log('ML Service:', response.data.mlService);
    console.log('Model:', response.data.model);
    return true;
  } catch (error) {
    console.error('✗ Health check failed:', error.message);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
    return false;
  }
}

async function testCORS() {
  console.log('\n=== Testing CORS Configuration ===');
  try {
    const response = await axios.options(`${BASE_URL}/api/health`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('✓ CORS preflight successful');
    return true;
  } catch (error) {
    console.error('✗ CORS test failed:', error.message);
    return false;
  }
}

async function testFileCleanup() {
  console.log('\n=== Testing File Cleanup ===');
  
  // Find a test image
  const testImages = [
    '0a3d19ca-a126-4ea3-83e3-0abb0e9b02e3___YLCV_GCREC 2449.JPG'
  ];
  
  let testImage = null;
  for (const img of testImages) {
    if (fs.existsSync(img)) {
      testImage = img;
      break;
    }
  }
  
  if (!testImage) {
    console.log('⚠ No test image found, skipping file cleanup test');
    return true;
  }
  
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImage));
    
    // Count files before upload
    const uploadDir = 'uploads/';
    const filesBefore = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir).length : 0;
    
    const response = await axios.post(`${BASE_URL}/api/analyze`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Count files after upload
    const filesAfter = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir).length : 0;
    
    if (filesAfter === filesBefore) {
      console.log('✓ File cleanup working - no new files in uploads directory');
      console.log(`Files before: ${filesBefore}, Files after: ${filesAfter}`);
      return true;
    } else {
      console.log('⚠ File cleanup may not be working');
      console.log(`Files before: ${filesBefore}, Files after: ${filesAfter}`);
      return false;
    }
  } catch (error) {
    console.error('✗ File cleanup test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting Backend Enhancement Tests...');
  console.log('Make sure the backend server is running on port 4000');
  
  const results = {
    healthCheck: await testHealthCheck(),
    cors: await testCORS(),
    fileCleanup: await testFileCleanup()
  };
  
  console.log('\n=== Test Results ===');
  console.log('Health Check:', results.healthCheck ? '✓ PASS' : '✗ FAIL');
  console.log('CORS:', results.cors ? '✓ PASS' : '✗ FAIL');
  console.log('File Cleanup:', results.fileCleanup ? '✓ PASS' : '✗ FAIL');
  
  const allPassed = Object.values(results).every(r => r === true);
  console.log('\nOverall:', allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED');
}

runTests();
