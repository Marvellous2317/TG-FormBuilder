import React from 'react';
import { TbError404 } from 'react-icons/tb';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 rounded-full p-4">
            <TbError404 className="w-16 h-16 text-blue-600 animate-bounce" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Page Not Found
          </p>
          <p className="text-gray-600 text-sm">
            The page you're looking for doesn't exist or has been moved. Don't
            worry, we can help you get back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Go to Home
          </Button>
          <Button
            onClick={() => window.history.back()}
            className="w-full flex justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Go Back
          </Button>
          <a
            href="/login"
            className="w-full block bg-transparent border-2 border-blue-600 hover:border-blue-700 text-blue-600 hover:text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Login
          </a>
        </div>

        {/* Helpful Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          If you think this is a mistake, please{' '}
          <a
            href="dev.team@tolaram.com"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
