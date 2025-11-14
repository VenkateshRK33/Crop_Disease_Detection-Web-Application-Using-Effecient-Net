import React from 'react';
import './HarvestRecommendation.css';

const HarvestRecommendation = ({ result }) => {
  if (!result) return null;

  const { optimalDate, optimalDays, expectedProfit, confidence, recommendation } = result;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return '#27AE60';
    if (conf >= 50) return '#F39C12';
    return '#E74C3C';
  };

  const getConfidenceLabel = (conf) => {
    if (conf >= 80) return 'High Confidence';
    if (conf >= 50) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="harvest-recommendation">
      <div className="recommendation-header">
        <h2>🎯 Optimal Harvest Recommendation</h2>
      </div>

      <div className="recommendation-cards">
        <div className="rec-card primary">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <div className="card-label">Optimal Harvest Date</div>
            <div className="card-value">{formatDate(optimalDate)}</div>
            <div className="card-subtext">
              {optimalDays === 0 ? 'Harvest now' : `Wait ${optimalDays} day${optimalDays > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        <div className="rec-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Expected Profit</div>
            <div className="card-value">₹{expectedProfit.toLocaleString('en-IN')}</div>
            <div className="card-subtext">Maximum potential earnings</div>
          </div>
        </div>

        <div className="rec-card">
          <div className="card-icon">
            {confidence >= 80 ? '✅' : confidence >= 50 ? '⚠️' : '❗'}
          </div>
          <div className="card-content">
            <div className="card-label">Confidence Score</div>
            <div className="card-value" style={{ color: getConfidenceColor(confidence) }}>
              {confidence}%
            </div>
            <div className="card-subtext">{getConfidenceLabel(confidence)}</div>
          </div>
        </div>
      </div>

      <div className="confidence-bar-container">
        <div className="confidence-bar">
          <div 
            className="confidence-fill"
            style={{ 
              width: `${confidence}%`,
              background: getConfidenceColor(confidence)
            }}
          />
        </div>
        <div className="confidence-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="recommendation-text">
        <div className="text-icon">💡</div>
        <div className="text-content">
          <h3>Recommendation</h3>
          <p>{recommendation}</p>
        </div>
      </div>
    </div>
  );
};

export default HarvestRecommendation;
