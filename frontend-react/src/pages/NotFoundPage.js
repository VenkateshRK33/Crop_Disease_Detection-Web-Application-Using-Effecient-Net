import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import './NotFoundPage.css';

/**
 * NotFoundPage Component
 * Custom 404 page with KrishiRaksha branding
 */
function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="not-found-page">
        <div className="not-found-content">
          <div className="not-found-icon">🌾</div>
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Page Not Found</h2>
          <p className="not-found-message">
            Oops! The page you're looking for seems to have wandered off into the fields.
            Let's get you back on track.
          </p>
          
          <div className="not-found-actions">
            <button 
              className="btn-home" 
              onClick={() => navigate('/')}
            >
              🏠 Go to Home
            </button>
            <button 
              className="btn-back" 
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
          </div>

          <div className="not-found-links">
            <h3>Quick Links</h3>
            <div className="quick-links-grid">
              <button onClick={() => navigate('/disease-detection')}>
                🔬 Disease Detection
              </button>
              <button onClick={() => navigate('/market-prices')}>
                📊 Market Prices
              </button>
              <button onClick={() => navigate('/environment')}>
                🌤️ Environment
              </button>
              <button onClick={() => navigate('/harvest-calculator')}>
                📈 Harvest Calculator
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default NotFoundPage;
