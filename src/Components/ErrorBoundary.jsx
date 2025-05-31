import React from "react";

class AppointmentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Appointment Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with the appointment system.</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn btn-primary"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppointmentErrorBoundary;
