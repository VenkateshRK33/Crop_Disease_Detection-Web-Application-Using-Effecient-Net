import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './EnvironmentalTrendCharts.css';

const EnvironmentalTrendCharts = ({ trends }) => {
  if (!trends || (!trends.temperature && !trends.humidity)) return null;

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Prepare data for charts
  const prepareChartData = () => {
    if (!trends.temperature || !trends.humidity) return [];
    
    const data = [];
    const maxLength = Math.max(trends.temperature.length, trends.humidity.length);
    
    for (let i = 0; i < maxLength; i++) {
      const tempData = trends.temperature[i];
      const humData = trends.humidity[i];
      
      data.push({
        date: formatDate(tempData?.date || humData?.date),
        temperature: tempData?.value || null,
        humidity: humData?.value || null
      });
    }
    
    return data;
  };

  const chartData = prepareChartData();

  if (chartData.length === 0) return null;

  return (
    <div className="environmental-trend-charts">
      <h2 className="charts-title">Environmental Trends (Last 7 Days)</h2>
      
      <div className="charts-container">
        {/* Temperature Trend Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Temperature Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                stroke="#6C757D"
                style={{ fontSize: '14px' }}
              />
              <YAxis 
                stroke="#6C757D"
                style={{ fontSize: '14px' }}
                label={{ value: '°C', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#E74C3C" 
                strokeWidth={3}
                dot={{ fill: '#E74C3C', r: 5 }}
                activeDot={{ r: 7 }}
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Humidity Trend Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Humidity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                stroke="#6C757D"
                style={{ fontSize: '14px' }}
              />
              <YAxis 
                stroke="#6C757D"
                style={{ fontSize: '14px' }}
                label={{ value: '%', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#3498DB" 
                strokeWidth={3}
                dot={{ fill: '#3498DB', r: 5 }}
                activeDot={{ r: 7 }}
                name="Humidity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalTrendCharts;
