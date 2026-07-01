import "./LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <output className="spinner-border text-primary">
          <span className="visually-hidden">Loading...</span>
        </output>
      </div>
    </div>
  );
};

export default LoadingSpinner;
