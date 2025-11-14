import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartWrapper from './ChartWrapper';
import SkeletonLoader from './SkeletonLoader';
import './PriceTrendChart.css';

/**
 * Price Trend Chart Component
 * Displays line chart showing price history over time
 * Includes date range selector
 */
const PriceTrendChart = ({ data, loading }) => {
  const [dateRange, setDateRange] = useState(30); // Default 30 days

  if (loading) {
    return (
      <ChartWrapper title="Price Trend Over Time">
        <SkeletonLoader type="chart" />
      </ChartWrapper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartWrapper title="Price Trend Over Time">
        <div className="chart-empty">No trend data available</div>
      </ChartWrapper>
    );
  }

  // Filter data based on selected date range
  const filteredData = data.slice(-dateRange);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date);
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">
            {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="tooltip-price">₹{data.avgPrice.toLocaleString('en-IN')}/quintal</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartWrapper title="Price Trend Over Time">
      <div className="trend-controls">
        <label className="trend-label">Date Range:</label>
        <div className="trend-buttons">
          <button
            className={`trend-button ${dateRange === 7 ? 'active' : ''}`}
            onClick={() => setDateRange(7)}
          >
            7 Days
          </button>
          <button
            className={`trend-button ${dateRange === 15 ? 'active' : ''}`}
            onClick={() => setDateRange(15)}
          >
            15 Days
          </button>
          <button
            className={`trend-button ${dateRange === 30 ? 'active' : ''}`}
            onClick={() => setDateRange(30)}
          >
            30 Days
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fill: '#2C3E50', fontSize: 12 }}
          />
          <YAxis 
            tick={{ fill: '#2C3E50', fontSize: 12 }}
            label={{ value: 'Price (₹/quintal)', angle: -90, position: 'insideLeft', style: { fill: '#2C3E50' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="avgPrice" 
            stroke="#2D5016" 
            strokeWidth={3}
            dot={{ fill: '#2D5016', r: 4 }}
            activeDot={{ r: 6 }}
            name="Average Price"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default PriceTrendChart;
