/**
 * Health Check Script
 * 
 * Verifies that all services are running correctly
 * 
 * Usage: node scripts/health-check.js
 */

const http = require('http');
const https = require('https');

const checks = [
  {
    name: 'Backend API',
    url: process.env.REACT_APP_API_URL || 'http://localhost:4000',
    path: '/health',
    timeout: 5000
  },
  {
    name: 'ML Service',
    url: process.env.ML_API_URL || 'http://localhost:5000',
    path: '/health',
    timeout: 5000
  }
];

function checkService(check) {
  return new Promise((resolve) => {
    const url = new URL(check.path, check.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(url, { timeout: check.timeout }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({
            name: check.name,
            status: 'healthy',
            statusCode: res.statusCode,
            response: data
          });
        } else {
          resolve({
            name: check.name,
            status: 'unhealthy',
            statusCode: res.statusCode,
            error: `Unexpected status code: ${res.statusCode}`
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: check.name,
        status: 'unhealthy',
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: check.name,
        status: 'unhealthy',
        error: 'Request timeout'
      });
    });
  });
}

async function runHealthChecks() {
  console.log('🏥 Running health checks...\n');
  
  const results = await Promise.all(checks.map(checkService));
  
  let allHealthy = true;
  
  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.status}`);
    
    if (result.statusCode) {
      console.log(`   Status Code: ${result.statusCode}`);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
      allHealthy = false;
    }
    
    console.log('');
  });
  
  if (allHealthy) {
    console.log('✅ All services are healthy!');
    process.exit(0);
  } else {
    console.log('❌ Some services are unhealthy!');
    process.exit(1);
  }
}

runHealthChecks();
