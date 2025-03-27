// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { Button } from './ui/button';

// Props for the ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode; // Child components to wrap
}

// State for the ErrorBoundary component
interface ErrorBoundaryState {
  hasError: boolean; // Flag to indicate if an error occurred
  errorMessage: string | null; // Error message to display
}

// ErrorBoundary component to catch and display errors in the UI
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  // Catch errors thrown in the component tree
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  // Log errors for debugging
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
  }

  // Reset the error state when the user clicks "Try Again"
  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p>{this.state.errorMessage || 'An unexpected error occurred.'}</p>
          <Button onClick={this.handleReset} className="mt-2">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;