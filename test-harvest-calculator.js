/**
 * Test script for Harvest Calculator API
 * Tests the /api/harvest/calculate endpoint
 */

const axios = require('axios');

const API_URL = 'http://localhost:4000';

async function testHarvestCalculator() {
  console.log('='.repeat(60));
  console.log('Testing Harvest Calculator API');
  console.log('='.repeat(60));

  try {
    // Test data
    const testData = {
      cropType: 'wheat',
      currentMaturity: 70,
      pestInfestation: 25,
      currentMarketPrice: 2500,
      expectedYield: 50
    };

    console.log('\n📊 Test Input:');
    console.log(JSON.stringify(testData, null, 2));

    console.log('\n🔄 Sending request to /api/harvest/calculate...');
    
    const response = await axios.post(`${API_URL}/api/harvest/calculate`, testData);

    if (response.data.success) {
      console.log('\n✅ SUCCESS! Calculation completed.');
      console.log('\n🎯 Optimal Harvest Recommendation:');
      console.log(`   Date: ${new Date(response.data.optimalDate).toLocaleDateString()}`);
      console.log(`   Days to wait: ${response.data.optimalDays}`);
      console.log(`   Expected profit: ₹${response.data.expectedProfit.toLocaleString()}`);
      console.log(`   Confidence: ${response.data.confidence}%`);
      
      console.log('\n💡 Recommendation:');
      console.log(`   ${response.data.recommendation}`);
      
      console.log('\n📈 Analysis:');
      console.log(`   Current value: ₹${response.data.analysis.currentValue.toLocaleString()}`);
      console.log(`   Potential growth: ₹${response.data.analysis.potentialGrowth.toLocaleString()}`);
      console.log(`   Pest damage risk: ${response.data.analysis.pestDamageRisk.toFixed(1)}%`);
      console.log(`   Maturity level: ${response.data.analysis.maturityLevel.toFixed(1)}%`);
      
      console.log(`\n📊 Generated ${response.data.scenarios.length} scenarios (0-30 days)`);
      
      // Show a few key scenarios
      const keyScenarios = [0, 7, 14, response.data.optimalDays, 21, 30].filter((v, i, a) => a.indexOf(v) === i);
      console.log('\n🔍 Key Scenarios:');
      keyScenarios.forEach(days => {
        const scenario = response.data.scenarios.find(s => s.days === days);
        if (scenario) {
          const optimal = days === response.data.optimalDays ? ' ⭐ OPTIMAL' : '';
          console.log(`   Day ${days}: ₹${scenario.profit.toLocaleString()} (Maturity: ${scenario.maturity}%, Pest: ${scenario.pestDamage}%)${optimal}`);
        }
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ All tests passed!');
      console.log('='.repeat(60));
    } else {
      console.error('\n❌ FAILED: API returned success: false');
      console.error(response.data);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Backend server is not running!');
      console.error('Please start the backend server first:');
      console.error('   cd backend && node server.js');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('❌ Tests failed');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Run tests
testHarvestCalculator();
