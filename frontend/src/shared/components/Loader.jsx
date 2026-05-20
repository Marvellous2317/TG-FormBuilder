import React from 'react';

export default function Loader({ size = 'h-4.5 w-4.5' }) {
  return (
    <div className="flex justify-center items-center h-full">
      <div
        className={`animate-spin rounded-full border-b-2 border-primary-200 ${size}`}
      ></div>
    </div>
  );
}
