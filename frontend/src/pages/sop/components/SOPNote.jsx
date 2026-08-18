import React from 'react';

export default function SOPNote({ lead, children }) {
  return (
    <div className="border-l-4 border-sop-400 bg-sop-300 px-5 py-3.5">
      <span className="text-sm text-sop-800">
        {lead && <span className="font-bold text-black">{lead} </span>}
        {children}
      </span>
    </div>
  );
}
