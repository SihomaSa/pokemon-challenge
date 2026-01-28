import React from 'react';
import './ErrorMessage.css';

/**
 * Error Message Component
 */
const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="error-title">¡Oops! Algo salió mal</h3>
      <p className="error-text">{message}</p>
      {onRetry && (
        <button className="error-retry" onClick={onRetry}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Intentar de nuevo
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;