import React from 'react';
import './ChartWrapper.css';

/**
 * Reusable Chart Wrapper Component
 * Provides consistent styling and layout for all charts
 */
const ChartWrapper = ({ title, children, className = '' }) => {
  return (
    <div className={`chart-wrapper ${className}`}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
};

export default ChartWrapper;
