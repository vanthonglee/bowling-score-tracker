// apps/frontend/src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { Button } from './ui/button';

// Props for the ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;
}

// State for the ErrorBoundary component
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded">
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