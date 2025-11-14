import './Spinner.css';

/**
 * Spinner Component
 * Displays a loading spinner for async operations
 */
function Spinner({ size = 'medium', color = 'primary', text = '' }) {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className={`spinner spinner-${color}`}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

export default Spinner;
