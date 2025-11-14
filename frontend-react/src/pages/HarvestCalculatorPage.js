import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import HarvestCalculatorForm from '../components/HarvestCalculatorForm';
import HarvestRecommendation from '../components/HarvestRecommendation';
import ScenarioComparisonChart from '../components/ScenarioComparisonChart';
import DetailedAnalysis from '../components/DetailedAnalysis';
import './HarvestCalculatorPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const HarvestCalculatorPage = () => {
  const [searchParams] = useSearchParams();
  const cropFromUrl = searchParams.get('crop');
  const pestFromUrl = searchParams.get('pest');
  const maturityFromUrl = searchParams.get('maturity');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCalculate = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/harvest/calculate`, {
        ...formData,
        userId: localStorage.getItem('userId') || null
      });

      if (response.data.success) {
        setResult(response.data);
        
        // Scroll to results
        setTimeout(() => {
          const resultsElement = document.getElementById('harvest-results');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        setError('Failed to calculate optimal harvest time. Please try again.');
      }
    } catch (err) {
      console.error('Calculation error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check your connection and try again.');
      } else {
        setError('An error occurred while calculating. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="harvest-calculator-page">
        <div className="page-hero">
          <div className="hero-content">
            <h1>🌾 Harvest Optimizer</h1>
            <p className="hero-subtitle">
              Maximize your profits by finding the optimal time to harvest your crops
            </p>
            <p className="hero-description">
              Our AI-powered calculator analyzes crop maturity, pest damage, and market conditions 
              to recommend the best harvest date for maximum profitability.
            </p>
          </div>
        </div>

        <div className="calculator-container">
          {cropFromUrl && (
            <div className="auto-selected-banner">
              <span className="banner-icon">🤖</span>
              <div>
                <strong>Smart Auto-Fill Activated!</strong>
                <p>Based on your leaf image analysis: <strong>{cropFromUrl}</strong> crop with <strong>{pestFromUrl}% pest infestation</strong> and <strong>{maturityFromUrl}% maturity</strong>. You can adjust these values below.</p>
              </div>
            </div>
          )}

          <div className="info-banner">
            <div className="banner-icon">💡</div>
            <div className="banner-content">
              <h3>How It Works</h3>
              <p>
                Enter your crop details, current maturity level, and pest infestation percentage. 
                Our algorithm will calculate the optimal harvest date by balancing crop growth 
                against pest damage and storage costs.
              </p>
            </div>
          </div>

          <HarvestCalculatorForm 
            onCalculate={handleCalculate}
            loading={loading}
            initialCrop={cropFromUrl}
            initialPest={pestFromUrl}
            initialMaturity={maturityFromUrl}
          />

          {error && (
            <div className="error-banner">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h4>Calculation Error</h4>
                <p>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div id="harvest-results" className="results-section">
              <HarvestRecommendation result={result} />
              
              <ScenarioComparisonChart 
                scenarios={result.scenarios}
                optimalDays={result.optimalDays}
              />
              
              <DetailedAnalysis 
                analysis={result.analysis}
                scenarios={result.scenarios}
              />

              <div className="action-banner">
                <div className="banner-icon">📱</div>
                <div className="banner-content">
                  <h3>Next Steps</h3>
                  <p>
                    Based on this recommendation, plan your harvest activities accordingly. 
                    Monitor your crop regularly and adjust for any changes in pest levels or weather conditions.
                  </p>
                  <button 
                    className="new-calculation-button"
                    onClick={() => {
                      setResult(null);
                      setError(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Calculate for Another Crop
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default HarvestCalculatorPage;
