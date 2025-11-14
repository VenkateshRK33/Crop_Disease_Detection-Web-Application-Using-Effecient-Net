import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import LocationSelector from '../components/LocationSelector';
import EnvironmentalMetrics from '../components/EnvironmentalMetrics';
import WeatherForecast from '../components/WeatherForecast';
import EnvironmentalTrendCharts from '../components/EnvironmentalTrendCharts';
import FarmingRecommendations from '../components/FarmingRecommendations';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import './EnvironmentPage.css';

const EnvironmentPage = () => {
  const [location, setLocation] = useState(null);
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationSelect = async (selectedLocation) => {
    setLocation(selectedLocation);
    setLoading(true);
    setError(null);

    try {
      // Fetch current environmental data
      const currentResponse = await fetch(
        `http://localhost:4000/api/environment/current?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`
      );
      
      if (!currentResponse.ok) {
        throw new Error('Failed to fetch environmental data');
      }
      
      const currentData = await currentResponse.json();
      setEnvironmentalData(currentData);

      // Fetch forecast data
      const forecastResponse = await fetch(
        `http://localhost:4000/api/environment/forecast?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`
      );
      
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const forecast = await forecastResponse.json();
      setForecastData(forecast);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching environmental data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="environment-page">
        <div className="page-header">
          <h1 className="page-title">Environmental Monitoring</h1>
          <p className="page-description">
            Real-time weather, temperature, humidity, and air quality data to help you make informed farming decisions
          </p>
        </div>

        <LocationSelector onLocationSelect={handleLocationSelect} />

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="metrics-grid">
              <SkeletonLoader type="metric-card" />
              <SkeletonLoader type="metric-card" />
              <SkeletonLoader type="metric-card" />
              <SkeletonLoader type="metric-card" />
            </div>
            <SkeletonLoader type="chart" />
          </div>
        )}

        {!loading && environmentalData && (
          <>
            <EnvironmentalMetrics data={environmentalData} />
            {forecastData && <WeatherForecast forecast={forecastData} />}
            {environmentalData.trends && (
              <EnvironmentalTrendCharts trends={environmentalData.trends} />
            )}
            <FarmingRecommendations 
              weather={environmentalData.current} 
              location={location}
            />
          </>
        )}

        {!loading && !environmentalData && !error && (
          <EmptyState
            icon="🌤️"
            title="Select a Location"
            message="Enter your location or use GPS to view real-time environmental data, weather forecasts, and farming recommendations for your area."
          />
        )}
      </div>
    </PageLayout>
  );
};

export default EnvironmentPage;
