import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import './ScenarioComparisonChart.css';

const ScenarioComparisonChart = ({ scenarios, optimalDays }) => {
  if (!scenarios || scenarios.length === 0) return null;

  // Format data for chart
  const chartData = scenarios.map(scenario => ({
    days: scenario.days,
    profit: scenario.profit,
    maturity: scenario.maturity,
    pestDamage: scenario.pestDamage,
    isOptimal: scenario.days === optimalDays
  }));

  // Find optimal scenario
  const optimalScenario = scenarios.find(s => s.days === optimalDays);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">
            {data.days === 0 ? 'Sell Now' : `Wait ${data.days} day${data.days > 1 ? 's' : ''}`}
          </p>
          <p className="tooltip-profit">
            <strong>Profit:</strong> ₹{data.profit.toLocaleString('en-IN')}
          </p>
          <p className="tooltip-detail">
            <strong>Maturity:</strong> {data.maturity}%
          </p>
          <p className="tooltip-detail">
            <strong>Pest Damage:</strong> {data.pestDamage}%
          </p>
          {data.isOptimal && (
            <p className="tooltip-optimal">⭐ Optimal Point</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Comparison points
  const comparisonPoints = [
    { days: 0, label: 'Sell Now' },
    { days: 7, label: '+7 days' },
    { days: 14, label: '+14 days' },
    { days: 21, label: '+21 days' }
  ].filter(point => scenarios.some(s => s.days === point.days));

  return (
    <div className="scenario-comparison-chart">
      <div className="chart-header">
        <h3>📈 Profit Projection Over Time</h3>
        <p>Compare potential profits for different harvest dates</p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis 
              dataKey="days" 
              label={{ value: 'Days to Wait', position: 'insideBottom', offset: -10 }}
              stroke="#7F8C8D"
            />
            <YAxis 
              label={{ value: 'Profit (₹)', angle: -90, position: 'insideLeft' }}
              stroke="#7F8C8D"
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#2D5016" 
              strokeWidth={3}
              dot={{ fill: '#2D5016', r: 4 }}
              activeDot={{ r: 6 }}
              name="Expected Profit"
            />
            {optimalScenario && (
              <ReferenceDot
                x={optimalDays}
                y={optimalScenario.profit}
                r={8}
                fill="#F4A300"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="comparison-points">
        <h4>Key Comparison Points</h4>
        <div className="points-grid">
          {comparisonPoints.map(point => {
            const scenario = scenarios.find(s => s.days === point.days);
            if (!scenario) return null;

            const isOptimal = point.days === optimalDays;

            return (
              <div 
                key={point.days} 
                className={`comparison-point ${isOptimal ? 'optimal' : ''}`}
              >
                <div className="point-header">
                  <span className="point-label">{point.label}</span>
                  {isOptimal && <span className="optimal-badge">⭐ Optimal</span>}
                </div>
                <div className="point-profit">
                  ₹{scenario.profit.toLocaleString('en-IN')}
                </div>
                <div className="point-details">
                  <span>Maturity: {scenario.maturity}%</span>
                  <span>Pest: {scenario.pestDamage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparisonChart;
