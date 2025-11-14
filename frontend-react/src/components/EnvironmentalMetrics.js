import React from 'react';
import './EnvironmentalMetrics.css';

const EnvironmentalMetrics = ({ data }) => {
  if (!data || !data.current) return null;

  const { weather, temperature, humidity, aqi } = data.current;

  // Helper function to get AQI status and color
  const getAQIStatus = (value) => {
    if (value <= 50) return { status: 'Good', color: 'green' };
    if (value <= 100) return { status: 'Moderate', color: 'yellow' };
    if (value <= 150) return { status: 'Unhealthy for Sensitive', color: 'orange' };
    if (value <= 200) return { status: 'Unhealthy', color: 'red' };
    if (value <= 300) return { status: 'Very Unhealthy', color: 'purple' };
    return { status: 'Hazardous', color: 'maroon' };
  };

  // Helper function to get temperature status
  const getTempStatus = (temp) => {
    if (temp < 10) return { status: 'Cold', color: 'blue' };
    if (temp < 25) return { status: 'Moderate', color: 'green' };
    if (temp < 35) return { status: 'Warm', color: 'yellow' };
    return { status: 'Hot', color: 'red' };
  };

  // Helper function to get humidity status
  const getHumidityStatus = (hum) => {
    if (hum < 30) return { status: 'Low', color: 'red' };
    if (hum < 60) return { status: 'Optimal', color: 'green' };
    if (hum < 80) return { status: 'High', color: 'yellow' };
    return { status: 'Very High', color: 'red' };
  };

  const aqiInfo = getAQIStatus(aqi || 0);
  const tempInfo = getTempStatus(temperature);
  const humidityInfo = getHumidityStatus(humidity);

  // Helper function to calculate gauge percentage
  const getGaugePercentage = (value, max) => {
    return Math.min((value / max) * 100, 100);
  };

  // Check if soil data is available
  const hasSoilData = data.current.soil && (data.current.soil.temperature || data.current.soil.moisture);

  return (
    <div className="environmental-metrics">
      <h2 className="metrics-title">Current Conditions</h2>
      <div className={`metrics-grid ${hasSoilData ? 'with-soil' : ''}`}>
        {/* Weather Card */}
        <div className="metric-card">
          <div className="metric-icon">🌤️</div>
          <h3 className="metric-label">Weather</h3>
          <div className="metric-value-large">{weather || 'Clear'}</div>
          <div className="metric-description">Current conditions</div>
        </div>

        {/* Temperature Card */}
        <div className="metric-card">
          <div className="metric-icon">🌡️</div>
          <h3 className="metric-label">Temperature</h3>
          <div className="gauge-container">
            <svg className="gauge" viewBox="0 0 100 100">
              <circle
                className="gauge-background"
                cx="50"
                cy="50"
                r="40"
              />
              <circle
                className={`gauge-progress gauge-${tempInfo.color}`}
                cx="50"
                cy="50"
                r="40"
                style={{
                  strokeDasharray: `${getGaugePercentage(temperature, 50) * 2.51} 251`
                }}
              />
              <text
                x="50"
                y="50"
                className="gauge-text"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {temperature}°C
              </text>
            </svg>
          </div>
          <div className={`metric-status status-${tempInfo.color}`}>
            {tempInfo.status}
          </div>
        </div>

        {/* Humidity Card */}
        <div className="metric-card">
          <div className="metric-icon">💧</div>
          <h3 className="metric-label">Humidity</h3>
          <div className="gauge-container">
            <svg className="gauge" viewBox="0 0 100 100">
              <circle
                className="gauge-background"
                cx="50"
                cy="50"
                r="40"
              />
              <circle
                className={`gauge-progress gauge-${humidityInfo.color}`}
                cx="50"
                cy="50"
                r="40"
                style={{
                  strokeDasharray: `${getGaugePercentage(humidity, 100) * 2.51} 251`
                }}
              />
              <text
                x="50"
                y="50"
                className="gauge-text"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {humidity}%
              </text>
            </svg>
          </div>
          <div className={`metric-status status-${humidityInfo.color}`}>
            {humidityInfo.status}
          </div>
        </div>

        {/* AQI Card */}
        <div className="metric-card">
          <div className="metric-icon">🌫️</div>
          <h3 className="metric-label">Air Quality</h3>
          <div className="gauge-container">
            <svg className="gauge" viewBox="0 0 100 100">
              <circle
                className="gauge-background"
                cx="50"
                cy="50"
                r="40"
              />
              <circle
                className={`gauge-progress gauge-${aqiInfo.color}`}
                cx="50"
                cy="50"
                r="40"
                style={{
                  strokeDasharray: `${getGaugePercentage(aqi || 0, 300) * 2.51} 251`
                }}
              />
              <text
                x="50"
                y="50"
                className="gauge-text"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {aqi || 'N/A'}
              </text>
            </svg>
          </div>
          <div className={`metric-status status-${aqiInfo.color}`}>
            {aqiInfo.status}
          </div>
        </div>

        {/* Soil Data Cards (if available) */}
        {hasSoilData && (
          <>
            {data.current.soil.temperature && (
              <div className="metric-card">
                <div className="metric-icon">🌱</div>
                <h3 className="metric-label">Soil Temp</h3>
                <div className="metric-value-large">{Math.round(data.current.soil.temperature)}°C</div>
                <div className="metric-description">Ground temperature</div>
              </div>
            )}
            {data.current.soil.moisture && (
              <div className="metric-card">
                <div className="metric-icon">💦</div>
                <h3 className="metric-label">Soil Moisture</h3>
                <div className="metric-value-large">{Math.round(data.current.soil.moisture)}%</div>
                <div className="metric-description">Ground moisture</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnvironmentalMetrics;
