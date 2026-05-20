import React from 'react';
import { MdLockOutline } from 'react-icons/md';
import Button from '../../shared/components/Button';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 rounded-full p-4">
            <MdLockOutline className="w-16 h-16 text-orange-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-lg font-semibold text-orange-600 mb-3">
            Unauthorized
          </p>
          <p className="text-gray-600 text-sm">
            You don't have permission to access this page. If you believe this
            is a mistake, please contact your administrator or try logging in
            with a different account.
          </p>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 text-left rounded">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Need access?</span> Request
            permission from your administrator or manager.
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
          <Button
            onClick={() => (window.location.href = '/login')}
            className="w-full bg-transparent border-2 border-blue-600 hover:border-blue-700 text-blue-600 hover:text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            Back to Login
          </Button>
        </div>

        {/* Helpful Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Having issues?{' '}
          <a
            href="dev.team@tolaram.com"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
