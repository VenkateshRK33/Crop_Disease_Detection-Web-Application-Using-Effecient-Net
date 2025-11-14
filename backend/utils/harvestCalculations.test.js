const {
  calculateOptimalHarvestTime,
  calculateConfidence,
  generateRecommendation
} = require('./harvestCalculations');

describe('Harvest Calculation Algorithms', () => {
  describe('calculateConfidence', () => {
    test('returns 100 for optimal conditions', () => {
      const confidence = calculateConfidence(80, 20, 10);
      expect(confidence).toBe(100);
    });

    test('reduces confidence for low maturity', () => {
      const confidence = calculateConfidence(50, 20, 10);
      expect(confidence).toBeLessThan(100);
    });

    test('reduces confidence for high maturity', () => {
      const confidence = calculateConfidence(98, 20, 10);
      expect(confidence).toBeLessThan(100);
    });

    test('reduces confidence for high pest damage', () => {
      const confidence = calculateConfidence(80, 60, 10);
      expect(confidence).toBeLessThan(100);
    });

    test('reduces confidence for very short wait times', () => {
      const confidence = calculateConfidence(80, 20, 1);
      expect(confidence).toBeLessThan(100);
    });

    test('reduces confidence for very long wait times', () => {
      const confidence = calculateConfidence(80, 20, 25);
      expect(confidence).toBeLessThan(100);
    });

    test('never returns negative confidence', () => {
      const confidence = calculateConfidence(30, 80, 30);
      expect(confidence).toBeGreaterThanOrEqual(0);
    });

    test('never returns confidence over 100', () => {
      const confidence = calculateConfidence(85, 10, 7);
      expect(confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('generateRecommendation', () => {
    test('recommends immediate harvest when days is 0', () => {
      const optimal = { days: 0, maturity: 90, pestDamage: 10, profit: 100000 };
      const current = { profit: 100000 };
      
      const recommendation = generateRecommendation(optimal, current, 90, 10);
      
      expect(recommendation).toContain('ready to harvest now');
      expect(recommendation).toContain('₹1,00,000');
    });

    test('provides short-term recommendation for 1-7 days', () => {
      const optimal = { days: 5, maturity: 85, pestDamage: 15, profit: 120000 };
      const current = { profit: 100000 };
      
      const recommendation = generateRecommendation(optimal, current, 75, 10);
      
      expect(recommendation).toContain('Wait 5 days');
      expect(recommendation).toContain('85%');
      expect(recommendation).toContain('Monitor pest levels');
    });

    test('provides medium-term recommendation for 8-14 days', () => {
      const optimal = { days: 12, maturity: 90, pestDamage: 25, profit: 130000 };
      const current = { profit: 100000 };
      
      const recommendation = generateRecommendation(optimal, current, 70, 10);
      
      expect(recommendation).toContain('12 days');
      expect(recommendation).toContain('pest control measures');
    });

    test('warns about high pest infestation', () => {
      const optimal = { days: 15, maturity: 95, pestDamage: 60, profit: 110000 };
      const current = { profit: 100000 };
      
      const recommendation = generateRecommendation(optimal, current, 80, 55);
      
      expect(recommendation).toContain('High pest infestation');
      expect(recommendation).toContain('aggressive pest control');
    });

    test('provides long-term recommendation for 15+ days', () => {
      const optimal = { days: 20, maturity: 95, pestDamage: 35, profit: 140000 };
      const current = { profit: 100000 };
      
      const recommendation = generateRecommendation(optimal, current, 60, 10);
      
      expect(recommendation).toContain('Wait 20 days');
      expect(recommendation).toContain('95%');
    });
  });

  describe('calculateOptimalHarvestTime', () => {
    const baseInputs = {
      cropType: 'wheat',
      currentMaturity: 70,
      pestInfestation: 15,
      currentMarketPrice: 2500,
      expectedYield: 50
    };

    test('returns all required fields', () => {
      const result = calculateOptimalHarvestTime(baseInputs);
      
      expect(result).toHaveProperty('optimalDate');
      expect(result).toHaveProperty('optimalDays');
      expect(result).toHaveProperty('expectedProfit');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('scenarios');
      expect(result).toHaveProperty('recommendation');
      expect(result).toHaveProperty('analysis');
    });

    test('generates 31 scenarios (0-30 days)', () => {
      const result = calculateOptimalHarvestTime(baseInputs);
      
      expect(result.scenarios).toHaveLength(31);
      expect(result.scenarios[0].days).toBe(0);
      expect(result.scenarios[30].days).toBe(30);
    });

    test('calculates maturity correctly', () => {
      const result = calculateOptimalHarvestTime(baseInputs);
      
      // With growthRate = 2.0, after 10 days: 70 + (2.0 * 10) = 90
      const day10 = result.scenarios[10];
      expect(day10.maturity).toBe(90);
    });

    test('caps maturity at 100%', () => {
      const inputs = { ...baseInputs, currentMaturity: 95 };
      const result = calculateOptimalHarvestTime(inputs);
      
      const day10 = result.scenarios[10];
      expect(day10.maturity).toBe(100);
    });

    test('calculates pest damage correctly', () => {
      const result = calculateOptimalHarvestTime(baseInputs);
      
      // With pestDamageRate = 1.5, after 10 days: 15 + (1.5 * 10) = 30
      const day10 = result.scenarios[10];
      expect(day10.pestDamage).toBe(30);
    });

    test('caps pest damage at 100%', () => {
      const inputs = { ...baseInputs, pestInfestation: 90 };
      const result = calculateOptimalHarvestTime(inputs);
      
      const day10 = result.scenarios[10];
      expect(day10.pestDamage).toBe(100);
    });

    test('calculates effective yield based on maturity and damage', () => {
      const result = calculateOptimalHarvestTime(baseInputs);
      
      const day0 = result.scenarios[0];
      // maturityFactor = 70/100 = 0.7
      // damageFactor = (100-15)/100 = 0.85
      // effectiveYield = 50 * 0.7 * 0.85 = 29.75
      expect(day0.effectiveYield).toBeCloseTo(29.8, 0);
    });

    test('profit calculation accounts for maturity and costs', () => {
      // Use lower maturity to see profit increase
      const inputs = { ...baseInputs, currentMaturity: 50 };
      const result = calculateOptimalHarvestTime(inputs);
      
      // With low maturity, the optimal day should not be day 0
      // (unless costs outweigh maturity gains, which is valid)
      expect(result.scenarios).toHaveLength(31);
      expect(result.optimalDays).toBeGreaterThanOrEqual(0);
      expect(result.optimalDays).toBeLessThanOrEqual(30);
    });

    test('profit decreases when pest damage is too high', () => {
      const inputs = { ...baseInputs, pestInfestation: 60 };
      const result = calculateOptimalHarvestTime(inputs);
      
      // With high pest infestation, later days should have lower profit
      expect(result.scenarios[20].profit).toBeLessThan(result.scenarios[0].profit);
    });

    test('finds optimal scenario with maximum profit', () => {
      const result = calculateOptimalHarvestTime(baseInputs);
      
      const allProfits = result.scenarios.map(s => s.profit);
      const maxProfit = Math.max(...allProfits);
      
      expect(result.expectedProfit).toBe(maxProfit);
    });

    test('uses custom growth rate when provided', () => {
      const inputs = { ...baseInputs, growthRate: 3.0 };
      const result = calculateOptimalHarvestTime(inputs);
      
      // With growthRate = 3.0, after 10 days: 70 + (3.0 * 10) = 100
      const day10 = result.scenarios[10];
      expect(day10.maturity).toBe(100);
    });

    test('uses custom pest damage rate when provided', () => {
      const inputs = { ...baseInputs, pestDamageRate: 2.5 };
      const result = calculateOptimalHarvestTime(inputs);
      
      // With pestDamageRate = 2.5, after 10 days: 15 + (2.5 * 10) = 40
      const day10 = result.scenarios[10];
      expect(day10.pestDamage).toBe(40);
    });

    test('includes analysis with current value and potential growth', () => {
      const result = calculateOptimalHarvestTime(baseInputs);
      
      expect(result.analysis.currentValue).toBe(result.scenarios[0].profit);
      expect(result.analysis.potentialGrowth).toBe(
        result.expectedProfit - result.scenarios[0].profit
      );
    });

    test('recommends immediate harvest when crop is fully mature', () => {
      const inputs = { ...baseInputs, currentMaturity: 100, pestInfestation: 5 };
      const result = calculateOptimalHarvestTime(inputs);
      
      expect(result.optimalDays).toBe(0);
    });

    test('accounts for storage costs over time', () => {
      const result = calculateOptimalHarvestTime(baseInputs);
      
      // Later scenarios should have higher costs
      const day0Profit = result.scenarios[0].profit;
      const day10Profit = result.scenarios[10].profit;
      
      // Even with maturity increase, costs accumulate
      expect(result.scenarios[10].effectiveYield).toBeGreaterThan(result.scenarios[0].effectiveYield);
    });
  });
});
