import React, { useState, useEffect } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import Button from './Button';

export const ErrorElement = () => {
  const error = useRouteError();
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    if (isRouteErrorResponse(error)) {
      setErrorMessage(error.status + ' ' + error.statusText);
      setErrorDetails(error.data?.message || error.data);
    } else if (error instanceof Error) {
      setErrorMessage(error.message);
      setErrorDetails(error.stack);
    } else {
      setErrorMessage('An unexpected error occurred');
      setErrorDetails(JSON.stringify(error));
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18zm0 0a9 9 0 110 18 9 9 0 010-18z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-lg font-semibold text-red-600 mb-2">
            {errorMessage}
          </p>
          {errorDetails && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                Error Details
              </summary>
              <pre className="mt-2 bg-gray-100 p-3 rounded text-xs text-gray-700 overflow-auto max-h-40 border border-gray-300">
                {typeof errorDetails === 'string'
                  ? errorDetails
                  : JSON.stringify(errorDetails, null, 2)}
              </pre>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Home
          </Button>
          <Button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </Button>
        </div>

        {/* Helpful text */}
        <p className="text-center text-gray-600 text-sm mt-6">
          If the problem persists, please contact support or{' '}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            try logging in again
          </a>
        </p>
      </div>
    </div>
  );
};

// Class component Error Boundary for non-route errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-linear-to-b from-red-50 to-white flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18zm0 0a9 9 0 110 18 9 9 0 010-18z"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-sm text-gray-600">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
