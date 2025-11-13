import './VisualPipeline.css';

/**
 * VisualPipeline Component
 * Displays a visual progress indicator for the analysis pipeline
 * 
 * @param {Array} steps - Array of step objects with id, label, status, icon, and optional message
 * Each step should have:
 *   - id: unique identifier
 *   - label: display text for the step
 *   - status: 'pending' | 'active' | 'complete'
 *   - icon: emoji or icon to display
 *   - message: optional status message
 */
function VisualPipeline({ steps }) {
  return (
    <div className="pipeline-section">
      {steps.map(step => (
        <div key={step.id} className={`pipeline-step ${step.status}`}>
          <div className="step-icon">{step.icon}</div>
          <div className="step-content">
            <div className="step-label">{step.label}</div>
            {step.message && (
              <div className="step-message">{step.message}</div>
            )}
          </div>
          <div className="step-status">
            {step.status === 'complete' && '✓'}
            {step.status === 'active' && (
              <div className="spinner">⟳</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default VisualPipeline;
