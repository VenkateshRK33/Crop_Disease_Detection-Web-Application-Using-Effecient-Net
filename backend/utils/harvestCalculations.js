/**
 * Calculate optimal harvest time based on crop conditions
 * @param {Object} inputs - Calculation inputs
 * @returns {Object} - Calculation results with scenarios and optimal recommendation
 */
function calculateOptimalHarvestTime(inputs) {
  const {
    cropType,
    currentMaturity,
    pestInfestation,
    currentMarketPrice,
    expectedYield,
    growthRate = 2.0,
    pestDamageRate = 1.5
  } = inputs;

  // Calculate scenarios for 0-30 days
  const scenarios = [];
  let optimalScenario = null;
  let maxProfit = -Infinity;

  for (let days = 0; days <= 30; days++) {
    // Calculate maturity (capped at 100%)
    const maturity = Math.min(100, currentMaturity + (growthRate * days));
    
    // Calculate pest damage (capped at 100%)
    const pestDamage = Math.min(100, pestInfestation + (pestDamageRate * days));
    
    // Calculate effective yield
    const maturityFactor = maturity / 100;
    const damageFactor = (100 - pestDamage) / 100;
    const effectiveYield = expectedYield * maturityFactor * damageFactor;
    
    // Calculate revenue
    const revenue = effectiveYield * currentMarketPrice;
    
    // Calculate costs (storage, labor, etc.)
    const dailyCosts = 100 + (expectedYield * currentMarketPrice * 0.02);
    const totalCosts = dailyCosts * days;
    
    // Calculate profit
    const profit = revenue - totalCosts;
    
    // Calculate date
    const date = new Date();
    date.setDate(date.getDate() + days);
    
    const scenario = {
      days,
      date: date.toISOString(),
      maturity: Math.round(maturity * 10) / 10,
      pestDamage: Math.round(pestDamage * 10) / 10,
      effectiveYield: Math.round(effectiveYield * 10) / 10,
      profit: Math.round(profit)
    };
    
    scenarios.push(scenario);
    
    // Track optimal scenario
    if (profit > maxProfit) {
      maxProfit = profit;
      optimalScenario = scenario;
    }
  }

  // Calculate confidence score
  const confidence = calculateConfidence(
    optimalScenario.maturity,
    optimalScenario.pestDamage,
    optimalScenario.days
  );

  // Generate recommendation text
  const recommendation = generateRecommendation(
    optimalScenario,
    scenarios[0],
    currentMaturity,
    pestInfestation
  );

  return {
    optimalDate: optimalScenario.date,
    optimalDays: optimalScenario.days,
    expectedProfit: optimalScenario.profit,
    confidence,
    scenarios,
    recommendation,
    analysis: {
      currentValue: scenarios[0].profit,
      potentialGrowth: optimalScenario.profit - scenarios[0].profit,
      pestDamageRisk: optimalScenario.pestDamage,
      maturityLevel: optimalScenario.maturity
    }
  };
}

/**
 * Calculate confidence score for harvest recommendation
 * @param {number} maturity - Crop maturity percentage
 * @param {number} pestDamage - Pest damage percentage
 * @param {number} days - Days to wait
 * @returns {number} - Confidence score (0-100)
 */
function calculateConfidence(maturity, pestDamage, days) {
  let confidence = 100;
  
  // Reduce confidence if maturity is too low or too high
  if (maturity < 70) {
    confidence -= (70 - maturity) * 0.5;
  } else if (maturity > 95) {
    confidence -= (maturity - 95) * 2;
  }
  
  // Reduce confidence based on pest damage
  if (pestDamage > 30) {
    confidence -= (pestDamage - 30) * 0.8;
  }
  
  // Reduce confidence for very short or very long wait times
  if (days < 3) {
    confidence -= (3 - days) * 5;
  } else if (days > 21) {
    confidence -= (days - 21) * 2;
  }
  
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

/**
 * Generate recommendation text based on optimal scenario
 * @param {Object} optimal - Optimal scenario
 * @param {Object} current - Current scenario (day 0)
 * @param {number} currentMaturity - Current maturity percentage
 * @param {number} pestInfestation - Current pest infestation percentage
 * @returns {string} - Recommendation text
 */
function generateRecommendation(optimal, current, currentMaturity, pestInfestation) {
  const profitDiff = optimal.profit - current.profit;
  const days = optimal.days;
  
  if (days === 0) {
    return `Your crop is ready to harvest now. Current conditions suggest immediate harvest will maximize your profit at ₹${optimal.profit.toLocaleString()}.`;
  }
  
  if (days <= 7) {
    return `Wait ${days} day${days > 1 ? 's' : ''} for optimal harvest. Your crop will reach ${optimal.maturity}% maturity, increasing profit by ₹${profitDiff.toLocaleString()} to ₹${optimal.profit.toLocaleString()}. Monitor pest levels closely.`;
  }
  
  if (days <= 14) {
    return `Optimal harvest in ${days} days. Waiting allows crop to mature to ${optimal.maturity}%, increasing profit by ₹${profitDiff.toLocaleString()}. However, pest damage may reach ${optimal.pestDamage}%, so implement pest control measures now.`;
  }
  
  if (pestInfestation > 50) {
    return `High pest infestation detected. While waiting ${days} days could increase maturity to ${optimal.maturity}%, pest damage will reach ${optimal.pestDamage}%. Consider harvesting earlier or implementing aggressive pest control immediately.`;
  }
  
  return `Wait ${days} days for optimal harvest at ${optimal.maturity}% maturity. Expected profit: ₹${optimal.profit.toLocaleString()}. Implement pest control to minimize damage risk (projected ${optimal.pestDamage}%).`;
}

module.exports = {
  calculateOptimalHarvestTime,
  calculateConfidence,
  generateRecommendation
};
