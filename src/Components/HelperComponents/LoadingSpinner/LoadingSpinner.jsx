import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
