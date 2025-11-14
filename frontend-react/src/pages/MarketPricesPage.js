import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import CropSelector from '../components/CropSelector';
import PriceComparisonChart from '../components/PriceComparisonChart';
import PriceTrendChart from '../components/PriceTrendChart';
import MarketDetailsTable from '../components/MarketDetailsTable';
import CropBuyingSection from '../components/CropBuyingSection';
import './MarketPricesPage.css';

/**
 * Market Prices Page
 * Displays real-time crop prices across different markets with visualizations
 */
const MarketPricesPage = () => {
  const [searchParams] = useSearchParams();
  const cropFromUrl = searchParams.get('crop');
  
  const [selectedCrop, setSelectedCrop] = useState(cropFromUrl || 'wheat');
  const [marketData, setMarketData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Update selected crop when URL parameter changes
  useEffect(() => {
    if (cropFromUrl && cropFromUrl !== selectedCrop) {
      setSelectedCrop(cropFromUrl);
    }
  }, [cropFromUrl]);

  // Fetch market prices when crop changes
  useEffect(() => {
    if (selectedCrop) {
      fetchMarketPrices(selectedCrop);
      fetchPriceTrend(selectedCrop);
    }
  }, [selectedCrop]);

  const fetchMarketPrices = async (crop) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/market-prices/${crop}`);
      
      if (response.data.success) {
        setMarketData(response.data.markets);
        setLastUpdated(new Date());
      } else {
        setError('Failed to fetch market prices');
      }
    } catch (err) {
      console.error('Error fetching market prices:', err);
      setError('Unable to load market prices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceTrend = async (crop) => {
    try {
      const response = await axios.get(`/api/market-prices/${crop}/history?days=30`);
      
      if (response.data.success) {
        setTrendData(response.data.trend);
      }
    } catch (err) {
      console.error('Error fetching price trend:', err);
    }
  };

  const handleRefresh = () => {
    if (selectedCrop) {
      fetchMarketPrices(selectedCrop);
      fetchPriceTrend(selectedCrop);
    }
  };

  return (
    <PageLayout>
      <div className="market-prices-page">
        <div className="market-prices-header">
          <div className="header-content">
            <h1 className="page-title">Market Prices</h1>
            <p className="page-description">
              Compare real-time crop prices across different markets to make informed selling decisions
            </p>
          </div>
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh prices"
          >
            <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>↻</span>
            Refresh
          </button>
        </div>

        {cropFromUrl && (
          <div className="auto-selected-banner">
            <span className="banner-icon">🎯</span>
            <span>Showing market prices for <strong>{selectedCrop}</strong> based on your disease detection analysis</span>
          </div>
        )}

        {lastUpdated && (
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <CropSelector 
          selectedCrop={selectedCrop}
          onCropChange={setSelectedCrop}
        />

        <div className="charts-section">
          <PriceComparisonChart 
            data={marketData}
            loading={loading}
          />

          <PriceTrendChart 
            data={trendData}
            loading={loading}
          />
        </div>

        <MarketDetailsTable 
          data={marketData}
          loading={loading}
        />

        <CropBuyingSection />
      </div>
    </PageLayout>
  );
};

export default MarketPricesPage;
