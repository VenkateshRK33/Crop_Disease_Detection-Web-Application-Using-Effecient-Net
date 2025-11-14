import { useState, useCallback } from 'react';
import Toast from './Toast';
import './ToastContainer.css';

/**
 * ToastContainer Component
 * Manages multiple toast notifications
 */
function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Export hook for using toasts
export const useToast = () => {
  // This will be used with a context provider
  return {
    showToast: (message, type, duration) => {
      // Implementation will be added with context
      console.log('Toast:', message, type);
    }
  };
};

export default ToastContainer;
