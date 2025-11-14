import './SkeletonLoader.css';

/**
 * SkeletonLoader Component
 * Displays animated skeleton placeholders while content is loading
 */
function SkeletonLoader({ type = 'text', width = '100%', height = '20px', count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'disease-card') {
    return (
      <div className="skeleton-disease-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-info">
          <div className="skeleton-line" style={{ width: '60%', height: '32px' }}></div>
          <div className="skeleton-line" style={{ width: '40%', height: '24px', marginTop: '16px' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '8px', marginTop: '12px' }}></div>
          <div className="skeleton-line" style={{ width: '80%', height: '16px', marginTop: '20px' }}></div>
          <div className="skeleton-line" style={{ width: '70%', height: '16px', marginTop: '8px' }}></div>
        </div>
      </div>
    );
  }

  if (type === 'message') {
    return (
      <div className="skeleton-message">
        <div className="skeleton-line" style={{ width: '90%', height: '16px' }}></div>
        <div className="skeleton-line" style={{ width: '75%', height: '16px', marginTop: '8px' }}></div>
        <div className="skeleton-line" style={{ width: '60%', height: '16px', marginTop: '8px' }}></div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="skeleton-card">
        <div className="skeleton-line" style={{ width: '100%', height: '150px', marginBottom: '16px' }}></div>
        <div className="skeleton-line" style={{ width: '70%', height: '24px', marginBottom: '12px' }}></div>
        <div className="skeleton-line" style={{ width: '90%', height: '16px', marginBottom: '8px' }}></div>
        <div className="skeleton-line" style={{ width: '60%', height: '16px' }}></div>
      </div>
    );
  }

  if (type === 'table-row') {
    return (
      <div className="skeleton-table-row">
        <div className="skeleton-line" style={{ width: '20%', height: '16px' }}></div>
        <div className="skeleton-line" style={{ width: '15%', height: '16px' }}></div>
        <div className="skeleton-line" style={{ width: '15%', height: '16px' }}></div>
        <div className="skeleton-line" style={{ width: '20%', height: '16px' }}></div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="skeleton-chart">
        <div className="skeleton-line" style={{ width: '40%', height: '24px', marginBottom: '20px' }}></div>
        <div className="skeleton-chart-bars">
          <div className="skeleton-bar" style={{ height: '60%' }}></div>
          <div className="skeleton-bar" style={{ height: '80%' }}></div>
          <div className="skeleton-bar" style={{ height: '45%' }}></div>
          <div className="skeleton-bar" style={{ height: '90%' }}></div>
          <div className="skeleton-bar" style={{ height: '70%' }}></div>
        </div>
      </div>
    );
  }

  if (type === 'metric-card') {
    return (
      <div className="skeleton-metric-card">
        <div className="skeleton-circle"></div>
        <div className="skeleton-line" style={{ width: '60%', height: '20px', marginTop: '16px' }}></div>
        <div className="skeleton-line" style={{ width: '40%', height: '32px', marginTop: '12px' }}></div>
      </div>
    );
  }

  if (type === 'calendar') {
    return (
      <div className="skeleton-calendar">
        <div className="skeleton-line" style={{ width: '50%', height: '28px', marginBottom: '20px' }}></div>
        <div className="skeleton-calendar-grid">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="skeleton-calendar-day"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="skeleton-container">
      {skeletons.map(i => (
        <div
          key={i}
          className="skeleton-line"
          style={{ width, height, marginBottom: count > 1 ? '8px' : '0' }}
        ></div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
