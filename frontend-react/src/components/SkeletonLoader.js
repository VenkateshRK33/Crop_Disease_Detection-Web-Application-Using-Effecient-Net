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
