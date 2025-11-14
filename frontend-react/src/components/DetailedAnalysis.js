import React from 'react';
import './DetailedAnalysis.css';

const DetailedAnalysis = ({ analysis, scenarios }) => {
  if (!analysis || !scenarios) return null;

  const { currentValue, potentialGrowth, pestDamageRisk, maturityLevel } = analysis;

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (value, type) => {
    if (type === 'maturity') {
      if (value >= 80) return '#27AE60';
      if (value >= 60) return '#F39C12';
      return '#E74C3C';
    }
    if (type === 'pest') {
      if (value <= 20) return '#27AE60';
      if (value <= 50) return '#F39C12';
      return '#E74C3C';
    }
    return '#2D5016';
  };

  const getMarketTrend = () => {
    // Simple trend analysis based on current price
    // In a real app, this would use historical data
    return 'Stable';
  };

  const marketTrend = getMarketTrend();

  return (
    <div className="detailed-analysis">
      <div className="analysis-header">
        <h3>📊 Detailed Analysis</h3>
        <p>Breakdown of factors affecting your harvest decision</p>
      </div>

      <div className="analysis-grid">
        <div className="analysis-card">
          <div className="card-icon-large">💵</div>
          <div className="card-body">
            <h4>Current Value</h4>
            <div className="card-main-value">{formatCurrency(currentValue)}</div>
            <p className="card-description">
              If you harvest and sell today, you would earn approximately {formatCurrency(currentValue)} based on current maturity and market conditions.
            </p>
          </div>
        </div>

        <div className="analysis-card highlight">
          <div className="card-icon-large">📈</div>
          <div className="card-body">
            <h4>Potential Growth</h4>
            <div className="card-main-value positive">
              +{formatCurrency(potentialGrowth)}
            </div>
            <p className="card-description">
              By waiting for optimal harvest time, you can potentially increase your profit by {formatCurrency(potentialGrowth)} through improved crop maturity.
            </p>
          </div>
        </div>

        <div className="analysis-card">
          <div className="card-icon-large">🐛</div>
          <div className="card-body">
            <h4>Pest Damage Risk</h4>
            <div 
              className="card-main-value"
              style={{ color: getStatusColor(pestDamageRisk, 'pest') }}
            >
              {pestDamageRisk.toFixed(1)}%
            </div>
            <p className="card-description">
              {pestDamageRisk <= 20 
                ? 'Low pest damage risk. Your crop is relatively safe from pest-related losses.'
                : pestDamageRisk <= 50
                ? 'Moderate pest damage expected. Consider implementing pest control measures.'
                : 'High pest damage risk. Immediate pest control is strongly recommended.'}
            </p>
          </div>
        </div>

        <div className="analysis-card">
          <div className="card-icon-large">🌾</div>
          <div className="card-body">
            <h4>Maturity Level</h4>
            <div 
              className="card-main-value"
              style={{ color: getStatusColor(maturityLevel, 'maturity') }}
            >
              {maturityLevel.toFixed(1)}%
            </div>
            <p className="card-description">
              {maturityLevel >= 80
                ? 'Excellent maturity level. Your crop is at or near peak maturity.'
                : maturityLevel >= 60
                ? 'Good maturity level. Crop is approaching optimal harvest readiness.'
                : 'Crop needs more time to mature for maximum yield and quality.'}
            </p>
          </div>
        </div>
      </div>

      <div className="market-trend-section">
        <div className="trend-header">
          <span className="trend-icon">📉</span>
          <h4>Market Trend Analysis</h4>
        </div>
        <div className="trend-content">
          <div className="trend-badge">{marketTrend}</div>
          <p>
            Current market conditions show a <strong>{marketTrend.toLowerCase()}</strong> trend. 
            {marketTrend === 'Stable' && ' Prices are expected to remain relatively consistent in the near term.'}
            {marketTrend === 'Rising' && ' Prices are trending upward, which may benefit delayed harvest.'}
            {marketTrend === 'Falling' && ' Prices are declining, consider harvesting sooner if possible.'}
          </p>
        </div>
      </div>

      <div className="reasoning-section">
        <div className="reasoning-header">
          <span className="reasoning-icon">🧠</span>
          <h4>Decision Reasoning</h4>
        </div>
        <div className="reasoning-content">
          <p>
            The optimal harvest recommendation balances multiple factors:
          </p>
          <ul className="reasoning-list">
            <li>
              <strong>Crop Maturity:</strong> Waiting allows your crop to reach {maturityLevel.toFixed(1)}% maturity, 
              maximizing yield quality and quantity.
            </li>
            <li>
              <strong>Pest Management:</strong> The projected pest damage of {pestDamageRisk.toFixed(1)}% is factored 
              into the calculation, balancing growth against potential losses.
            </li>
            <li>
              <strong>Economic Factors:</strong> Storage costs, labor, and market conditions are considered 
              to maximize net profit.
            </li>
            <li>
              <strong>Risk Assessment:</strong> The confidence score reflects the reliability of this 
              recommendation based on current conditions.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis;
