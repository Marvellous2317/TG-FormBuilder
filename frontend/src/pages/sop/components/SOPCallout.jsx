import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

export default function SOPCallout({ children }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sop-400/40 bg-sop-500 px-5 py-3.5">
      <FaExclamationCircle className="shrink-0 text-sop-400" />
      <span className="text-sm text-sop-400">{children}</span>
    </div>
  );
}
