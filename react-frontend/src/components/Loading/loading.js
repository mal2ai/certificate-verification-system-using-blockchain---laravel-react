import React from "react";
import "components/Loading/LoadingSpinner.css"; // Import CSS for the spinner

const LoadingSpinner = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
