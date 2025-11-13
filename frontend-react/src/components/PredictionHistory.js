import React, { useState, useEffect } from 'react';
import './PredictionHistory.css';

const PredictionHistory = ({ userId, onPredictionClick }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchPredictions();
  }, [userId]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:4000/api/predictions/${userId}?limit=20`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prediction history');
      }

      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDiseaseName = (disease) => {
    return disease
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  };

  if (!userId) {
    return (
      <div className="prediction-history">
        <div className="history-empty">
          <p>Sign in to view your prediction history</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="prediction-history">
        <h2>📜 Prediction History</h2>
        <div className="history-loading">
          <div className="spinner"></div>
          <p>Loading your history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prediction-history">
        <h2>📜 Prediction History</h2>
        <div className="history-error">
          <p>❌ {error}</p>
          <button onClick={fetchPredictions} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="prediction-history">
        <h2>📜 Prediction History</h2>
        <div className="history-empty">
          <p>No predictions yet. Upload your first plant image to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prediction-history">
      <h2>📜 Prediction History</h2>
      <div className="history-list">
        {predictions.map((prediction) => (
          <div
            key={prediction._id}
            className="history-item"
            onClick={() => onPredictionClick && onPredictionClick(prediction)}
          >
            <div className="history-item-header">
              <h3>{formatDiseaseName(prediction.disease)}</h3>
              <span className={`confidence-badge ${getConfidenceColor(prediction.confidence)}`}>
                {(prediction.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="history-item-details">
              <span className="crop-type">🌿 {prediction.cropType}</span>
              <span className="timestamp">🕒 {formatDate(prediction.timestamp)}</span>
            </div>
            {prediction.topPredictions && prediction.topPredictions.length > 1 && (
              <div className="alternative-predictions">
                <span className="alternatives-label">Also considered:</span>
                <span className="alternatives-list">
                  {prediction.topPredictions
                    .slice(1, 3)
                    .map(p => formatDiseaseName(p.class))
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionHistory;
