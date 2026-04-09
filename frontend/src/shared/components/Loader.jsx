import React from 'react';

export default function Loader({ size = 'h-4.5 w-4.5' }) {
  return (
    <div
      className={`flex items-center justify-center animate-spin rounded-full border-b-2 border-white ${size}`}
    ></div>
  );
}
