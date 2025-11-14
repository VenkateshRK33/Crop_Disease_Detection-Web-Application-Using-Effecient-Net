import React from 'react';
import './FarmingRecommendations.css';

const FarmingRecommendations = ({ weather, location }) => {
  if (!weather) return null;

  // Generate recommendations based on weather conditions
  const generateRecommendations = () => {
    const recommendations = [];
    const alerts = [];

    const { temperature, humidity, weather: condition } = weather;

    // Temperature-based recommendations
    if (temperature > 35) {
      alerts.push({
        type: 'warning',
        icon: '🌡️',
        message: 'High temperature alert! Ensure adequate irrigation for crops.'
      });
      recommendations.push({
        icon: '💧',
        title: 'Increase Irrigation',
        description: 'Water crops early morning or late evening to prevent water loss through evaporation.'
      });
    } else if (temperature < 10) {
      alerts.push({
        type: 'warning',
        icon: '❄️',
        message: 'Low temperature alert! Protect sensitive crops from frost.'
      });
      recommendations.push({
        icon: '🛡️',
        title: 'Frost Protection',
        description: 'Cover sensitive plants and consider using frost blankets or mulch.'
      });
    } else if (temperature >= 20 && temperature <= 30) {
      recommendations.push({
        icon: '✅',
        title: 'Optimal Temperature',
        description: 'Good conditions for most farming activities. Consider planting or transplanting.'
      });
    }

    // Humidity-based recommendations
    if (humidity > 80) {
      alerts.push({
        type: 'caution',
        icon: '💧',
        message: 'High humidity may increase risk of fungal diseases.'
      });
      recommendations.push({
        icon: '🔬',
        title: 'Monitor for Diseases',
        description: 'Check plants regularly for signs of fungal infections. Ensure good air circulation.'
      });
    } else if (humidity < 30) {
      recommendations.push({
        icon: '💨',
        title: 'Low Humidity',
        description: 'Increase watering frequency and consider using mulch to retain soil moisture.'
      });
    }

    // Weather condition-based recommendations
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain')) {
      recommendations.push({
        icon: '🌧️',
        title: 'Rainy Conditions',
        description: 'Postpone irrigation and fertilizer application. Check drainage systems.'
      });
    } else if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      recommendations.push({
        icon: '☀️',
        title: 'Clear Weather',
        description: 'Good day for spraying pesticides or applying fertilizers. Ensure adequate watering.'
      });
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        icon: '🌱',
        title: 'Regular Maintenance',
        description: 'Continue with regular crop monitoring and maintenance activities.'
      });
    }

    return { recommendations, alerts };
  };

  const { recommendations, alerts } = generateRecommendations();

  return (
    <div className="farming-recommendations">
      <h2 className="recommendations-title">Farming Recommendations</h2>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.map((alert, index) => (
            <div key={index} className={`alert alert-${alert.type}`}>
              <span className="alert-icon">{alert.icon}</span>
              <span className="alert-message">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="recommendations-grid">
        {recommendations.map((rec, index) => (
          <div key={index} className="recommendation-card">
            <div className="recommendation-icon">{rec.icon}</div>
            <h3 className="recommendation-title">{rec.title}</h3>
            <p className="recommendation-description">{rec.description}</p>
          </div>
        ))}
      </div>

      {/* Additional Tips */}
      <div className="tips-section">
        <h3 className="tips-title">💡 General Tips</h3>
        <ul className="tips-list">
          <li>Monitor weather forecasts regularly for better planning</li>
          <li>Keep records of weather patterns and crop performance</li>
          <li>Adjust irrigation schedules based on rainfall and temperature</li>
          <li>Inspect crops daily for early detection of pests and diseases</li>
        </ul>
      </div>
    </div>
  );
};

export default FarmingRecommendations;
