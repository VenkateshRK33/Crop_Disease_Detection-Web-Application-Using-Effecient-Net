import React, { useState } from 'react';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import './MarketDetailsTable.css';

/**
 * Market Details Table Component
 * Displays detailed market information with sorting functionality
 * Responsive design (cards on mobile)
 */
const MarketDetailsTable = ({ data, loading }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'price', direction: 'asc' });

  if (loading) {
    return (
      <div className="market-table-wrapper">
        <h3 className="market-table-title">Market Details</h3>
        <div className="table-loading-skeleton">
          <SkeletonLoader type="table-row" count={5} />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="market-table-wrapper">
        <h3 className="market-table-title">Market Details</h3>
        <EmptyState
          icon="📊"
          title="No Market Data"
          message="Market price information is not available for this crop at the moment. Please try selecting a different crop or refresh the page."
        />
      </div>
    );
  }

  // Sorting function
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="sort-icon">⇅</span>;
    }
    return <span className="sort-icon active">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="market-table-wrapper">
      <h3 className="market-table-title">Market Details</h3>
      
      {/* Desktop Table View */}
      <div className="market-table-desktop">
        <table className="market-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('market')} className="sortable">
                Market <SortIcon columnKey="market" />
              </th>
              <th onClick={() => handleSort('price')} className="sortable">
                Price (₹/quintal) <SortIcon columnKey="price" />
              </th>
              <th onClick={() => handleSort('distance')} className="sortable">
                Distance (km) <SortIcon columnKey="distance" />
              </th>
              <th onClick={() => handleSort('lastUpdated')} className="sortable">
                Last Updated <SortIcon columnKey="lastUpdated" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((market, index) => (
              <tr key={index}>
                <td className="market-name">{market.market}</td>
                <td className="market-price">₹{market.price.toLocaleString('en-IN')}</td>
                <td className="market-distance">{market.distance} km</td>
                <td className="market-updated">{formatDate(market.lastUpdated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="market-table-mobile">
        {sortedData.map((market, index) => (
          <div key={index} className="market-card">
            <div className="market-card-header">
              <h4 className="market-card-name">{market.market}</h4>
              <span className="market-card-price">₹{market.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="market-card-details">
              <div className="market-card-detail">
                <span className="detail-label">Distance:</span>
                <span className="detail-value">{market.distance} km</span>
              </div>
              <div className="market-card-detail">
                <span className="detail-label">Updated:</span>
                <span className="detail-value">{formatDate(market.lastUpdated)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketDetailsTable;
