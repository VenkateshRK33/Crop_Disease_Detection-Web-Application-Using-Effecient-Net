/**
 * Test script for Environmental Monitoring API endpoints
 * Tests all integrated weather and environmental APIs
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
const TEST_COORDS = {
  lat: 28.7041,  // Delhi coordinates
  lon: 77.1025
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url) {
  try {
    log(`\n${'='.repeat(60)}`, 'blue');
    log(`Testing: ${name}`, 'blue');
    log(`URL: ${url}`, 'blue');
    log('='.repeat(60), 'blue');
    
    const startTime = Date.now();
    const response = await axios.get(url, { timeout: 15000 });
    const duration = Date.now() - startTime;
    
    log(`✓ Success (${duration}ms)`, 'green');
    log(`Status: ${response.status}`, 'green');
    log(`Source: ${response.data.source || 'N/A'}`, 'green');
    
    // Display key data
    if (response.data.current) {
      log('\nCurrent Conditions:', 'yellow');
      log(`  Weather: ${response.data.current.weather}`, 'yellow');
      log(`  Temperature: ${response.data.current.temperature}°C`, 'yellow');
      log(`  Humidity: ${response.data.current.humidity}%`, 'yellow');
      log(`  AQI: ${response.data.current.aqi || 'N/A'}`, 'yellow');
      
      if (response.data.current.soil) {
        log(`  Soil Temp: ${response.data.current.soil.temperature}°C`, 'yellow');
        log(`  Soil Moisture: ${response.data.current.soil.moisture}%`, 'yellow');
      }
    }
    
    if (response.data.forecast) {
      log(`\nForecast Days: ${response.data.forecast.length}`, 'yellow');
      log(`First Day: ${response.data.forecast[0].date} - ${response.data.forecast[0].weather} (${response.data.forecast[0].temp}°C)`, 'yellow');
    }
    
    if (response.data.seasonal) {
      log(`\nSeasonal Weeks: ${response.data.seasonal.length}`, 'yellow');
      log(`First Week: ${response.data.seasonal[0].startDate} - Avg Max: ${response.data.seasonal[0].avgTempMax}°C`, 'yellow');
    }
    
    if (response.data.trends) {
      log(`\nTrends Available:`, 'yellow');
      log(`  Temperature points: ${response.data.trends.temperature?.length || 0}`, 'yellow');
      log(`  Humidity points: ${response.data.trends.humidity?.length || 0}`, 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`✗ Failed`, 'red');
    log(`Error: ${error.message}`, 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return false;
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('ENVIRONMENTAL MONITORING API TEST SUITE', 'blue');
  log('='.repeat(60), 'blue');
  
  const tests = [
    {
      name: 'Current Environmental Data',
      url: `${BASE_URL}/api/environment/current?lat=${TEST_COORDS.lat}&lon=${TEST_COORDS.lon}`
    },
    {
      name: '7-Day Weather Forecast',
      url: `${BASE_URL}/api/environment/forecast?lat=${TEST_COORDS.lat}&lon=${TEST_COORDS.lon}`
    },
    {
      name: 'Seasonal Forecast (90 days)',
      url: `${BASE_URL}/api/environment/seasonal?lat=${TEST_COORDS.lat}&lon=${TEST_COORDS.lon}`
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const success = await testEndpoint(test.name, test.url);
    results.push({ name: test.name, success });
    
    // Wait a bit between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('TEST SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✓ PASS' : '✗ FAIL';
    const color = result.success ? 'green' : 'red';
    log(`${status} - ${result.name}`, color);
  });
  
  log(`\nTotal: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All tests passed! Environmental APIs are working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the errors above.', 'yellow');
  }
  
  log('\n' + '='.repeat(60), 'blue');
}

// Run tests
runTests().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
