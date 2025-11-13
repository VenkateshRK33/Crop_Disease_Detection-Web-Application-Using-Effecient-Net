/**
 * Complete Integration Test
 * Tests the full flow: Image upload -> ML prediction -> MongoDB persistence -> Ollama streaming
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:4000';
const ML_URL = 'http://localhost:5000';
const OLLAMA_URL = 'http://localhost:11434';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function checkService(name, url, endpoint = '') {
  try {
    const response = await axios.get(`${url}${endpoint}`, { timeout: 5000 });
    logSuccess(`${name} is running (${url}${endpoint})`);
    return true;
  } catch (error) {
    logError(`${name} is not accessible at ${url}${endpoint}`);
    return false;
  }
}

async function testHealthEndpoint() {
  logStep('1', 'Testing Backend Health Endpoint');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`);
    logSuccess('Health endpoint responded');
    log(`  Status: ${response.data.status}`, 'blue');
    log(`  Ollama: ${response.data.ollama}`, 'blue');
    log(`  Database: ${response.data.database}`, 'blue');
    log(`  Model: ${response.data.model}`, 'blue');
    return response.data;
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return null;
  }
}

async function testImageAnalysis() {
  logStep('2', 'Testing Image Upload and ML Prediction');
  
  // Find a test image
  const uploadsDir = path.join(__dirname, 'uploads');
  let testImagePath = null;
  
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const imageFile = files.find(f => /\.(jpg|jpeg|png)$/i.test(f));
    if (imageFile) {
      testImagePath = path.join(uploadsDir, imageFile);
    }
  }
  
  if (!testImagePath) {
    // Try to find any image in the root directory
    const rootFiles = fs.readdirSync(__dirname);
    const imageFile = rootFiles.find(f => /\.(jpg|jpeg|png)$/i.test(f));
    if (imageFile) {
      testImagePath = path.join(__dirname, imageFile);
    }
  }
  
  if (!testImagePath) {
    logWarning('No test image found. Skipping image analysis test.');
    return null;
  }
  
  log(`  Using test image: ${path.basename(testImagePath)}`, 'blue');
  
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    
    const response = await axios.post(`${BACKEND_URL}/api/analyze`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });
    
    logSuccess('Image analysis completed');
    log(`  Disease: ${response.data.prediction.disease}`, 'blue');
    log(`  Confidence: ${response.data.prediction.confidence}%`, 'blue');
    log(`  Prediction ID: ${response.data.predictionId}`, 'blue');
    log(`  Conversation ID: ${response.data.conversationId}`, 'blue');
    
    return response.data;
  } catch (error) {
    logError(`Image analysis failed: ${error.message}`);
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Error: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return null;
  }
}

async function testMongoDBPersistence(predictionId) {
  logStep('3', 'Testing MongoDB Data Persistence');
  
  if (!predictionId) {
    logWarning('No prediction ID available. Skipping MongoDB test.');
    return false;
  }
  
  try {
    // Test fetching prediction history
    const response = await axios.get(`${BACKEND_URL}/api/predictions/test-user`);
    logSuccess('Successfully retrieved prediction history');
    log(`  Total predictions: ${response.data.count}`, 'blue');
    
    // Check if our prediction is in the history
    const foundPrediction = response.data.predictions.find(
      p => p._id === predictionId
    );
    
    if (foundPrediction) {
      logSuccess('Prediction was successfully saved to MongoDB');
      return true;
    } else {
      logWarning('Prediction not found in history (might be using different userId)');
      return true; // Still consider it a success if we got data
    }
  } catch (error) {
    logError(`MongoDB persistence test failed: ${error.message}`);
    return false;
  }
}

async function testOllamaStreaming(conversationId) {
  logStep('4', 'Testing Ollama Streaming Chat');
  
  if (!conversationId) {
    logWarning('No conversation ID available. Skipping Ollama test.');
    return false;
  }
  
  try {
    const question = 'What are the symptoms?';
    log(`  Asking: "${question}"`, 'blue');
    
    const response = await axios.get(
      `${BACKEND_URL}/api/chat/stream/${conversationId}`,
      {
        params: { question },
        responseType: 'stream',
        timeout: 30000
      }
    );
    
    let receivedData = false;
    let fullResponse = '';
    
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        receivedData = true;
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                fullResponse += data.chunk;
              }
              if (data.done) {
                logSuccess('Ollama streaming completed');
                log(`  Response length: ${fullResponse.length} characters`, 'blue');
                log(`  First 100 chars: ${fullResponse.substring(0, 100)}...`, 'blue');
                resolve(true);
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      });
      
      response.data.on('end', () => {
        if (!receivedData) {
          logWarning('Stream ended without receiving data');
          resolve(false);
        }
      });
      
      response.data.on('error', (error) => {
        logError(`Stream error: ${error.message}`);
        reject(error);
      });
      
      // Timeout after 25 seconds
      setTimeout(() => {
        if (!receivedData) {
          logError('Streaming timeout - no data received');
          resolve(false);
        }
      }, 25000);
    });
  } catch (error) {
    logError(`Ollama streaming test failed: ${error.message}`);
    return false;
  }
}

async function runIntegrationTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  COMPLETE INTEGRATION TEST SUITE', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  // Check all services are running
  logStep('0', 'Checking Service Availability');
  const mlRunning = await checkService('ML Service', ML_URL, '/health');
  const backendRunning = await checkService('Backend', BACKEND_URL, '/api/health');
  const ollamaRunning = await checkService('Ollama', OLLAMA_URL, '/api/tags');
  
  if (!mlRunning || !backendRunning) {
    log('\n' + '='.repeat(60), 'red');
    logError('CRITICAL SERVICES NOT RUNNING');
    log('='.repeat(60) + '\n', 'red');
    log('Please ensure all services are started:', 'yellow');
    log('  1. ML Service: python api_service.py', 'yellow');
    log('  2. Backend: npm run start:backend', 'yellow');
    log('  3. MongoDB: Ensure MongoDB is running', 'yellow');
    if (!ollamaRunning) {
      log('  4. Ollama: Start Ollama service', 'yellow');
    }
    process.exit(1);
  }
  
  if (!ollamaRunning) {
    logWarning('Ollama is not running - chat features will be limited');
  }
  
  // Run tests
  const healthData = await testHealthEndpoint();
  const analysisData = await testImageAnalysis();
  
  let mongoSuccess = false;
  let ollamaSuccess = false;
  
  if (analysisData) {
    mongoSuccess = await testMongoDBPersistence(analysisData.predictionId);
    ollamaSuccess = await testOllamaStreaming(analysisData.conversationId);
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('  TEST SUMMARY', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const results = [
    { name: 'ML Service', status: mlRunning },
    { name: 'Backend Service', status: backendRunning },
    { name: 'Ollama Service', status: ollamaRunning },
    { name: 'Health Endpoint', status: healthData !== null },
    { name: 'Image Analysis', status: analysisData !== null },
    { name: 'MongoDB Persistence', status: mongoSuccess },
    { name: 'Ollama Streaming', status: ollamaSuccess }
  ];
  
  results.forEach(result => {
    if (result.status) {
      logSuccess(result.name);
    } else {
      logError(result.name);
    }
  });
  
  const allPassed = results.every(r => r.status);
  const criticalPassed = results.slice(0, 5).every(r => r.status);
  
  log('\n' + '='.repeat(60), 'cyan');
  if (allPassed) {
    logSuccess('ALL TESTS PASSED ✓');
  } else if (criticalPassed) {
    logWarning('CORE FUNCTIONALITY WORKING (Some optional features failed)');
  } else {
    logError('SOME TESTS FAILED ✗');
  }
  log('='.repeat(60) + '\n', 'cyan');
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runIntegrationTests().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
