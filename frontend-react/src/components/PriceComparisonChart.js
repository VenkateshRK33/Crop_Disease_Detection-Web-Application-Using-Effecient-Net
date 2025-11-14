import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartWrapper from './ChartWrapper';
import SkeletonLoader from './SkeletonLoader';
import './PriceComparisonChart.css';

/**
 * Price Comparison Chart Component
 * Displays bar chart comparing prices across different markets
 * Highlights the best (lowest) price
 */
const PriceComparisonChart = ({ data, loading }) => {
  if (loading) {
    return (
      <ChartWrapper title="Price Comparison Across Markets">
        <SkeletonLoader type="chart" />
      </ChartWrapper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartWrapper title="Price Comparison Across Markets">
        <div className="chart-empty">No price data available</div>
      </ChartWrapper>
    );
  }

  // Find the best (lowest) price
  const bestPrice = Math.min(...data.map(item => item.price));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-market">{data.market}</p>
          <p className="tooltip-price">₹{data.price.toLocaleString('en-IN')}/{data.unit}</p>
          <p className="tooltip-distance">{data.distance} km away</p>
          {data.price === bestPrice && (
            <p className="tooltip-best">✓ Best Price</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartWrapper title="Price Comparison Across Markets">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis 
            dataKey="market" 
            tick={{ fill: '#2C3E50', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fill: '#2C3E50', fontSize: 12 }}
            label={{ value: 'Price (₹/quintal)', angle: -90, position: 'insideLeft', style: { fill: '#2C3E50' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="price" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.price === bestPrice ? '#27AE60' : '#2D5016'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="price-legend">
        <span className="legend-item">
          <span className="legend-color best"></span>
          Best Price
        </span>
        <span className="legend-item">
          <span className="legend-color normal"></span>
          Other Markets
        </span>
      </div>
    </ChartWrapper>
  );
};

export default PriceComparisonChart;
