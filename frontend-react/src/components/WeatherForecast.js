import React from 'react';
import './WeatherForecast.css';

const WeatherForecast = ({ forecast }) => {
  if (!forecast || !forecast.length) return null;

  // Helper function to get weather icon
  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return '☀️';
    if (conditionLower.includes('cloud')) return '⛅';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
    return '🌤️';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      day: days[date.getDay()],
      date: `${months[date.getMonth()]} ${date.getDate()}`
    };
  };

  return (
    <div className="weather-forecast">
      <h2 className="forecast-title">7-Day Weather Forecast</h2>
      <div className="forecast-container">
        <div className="forecast-scroll">
          {forecast.slice(0, 7).map((day, index) => {
            const dateInfo = formatDate(day.date);
            return (
              <div key={index} className="forecast-card">
                <div className="forecast-day">{dateInfo.day}</div>
                <div className="forecast-date">{dateInfo.date}</div>
                <div className="forecast-icon">
                  {getWeatherIcon(day.weather)}
                </div>
                <div className="forecast-weather">{day.weather}</div>
                <div className="forecast-temp">
                  <span className="temp-high">{day.temp}°</span>
                  {day.tempMin && (
                    <span className="temp-low">{day.tempMin}°</span>
                  )}
                </div>
                {day.humidity && (
                  <div className="forecast-humidity">
                    💧 {day.humidity}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
