import React from 'react';
import './Loading.css';

/**
 * Enhanced Loading Component
 */
const Loading = ({ message = "Cargando..." }) => {
  return (
    <div className="loading-container">
      <div className="pokeball-spinner">
        <div className="pokeball-half pokeball-top"></div>
        <div className="pokeball-half pokeball-bottom"></div>
        <div className="pokeball-middle"></div>
        <div className="pokeball-center">
          <div className="pokeball-center-inner"></div>
        </div>
      </div>
      <p className="loading-message">{message}</p>
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default Loading;