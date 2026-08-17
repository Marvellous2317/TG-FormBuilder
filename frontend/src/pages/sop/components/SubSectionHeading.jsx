import React from 'react';

export default function SubSectionHeading({ number, title }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sop-100 text-xs font-bold">{number}</span>
      <span className="text-2xl font-extrabold">{title}</span>
    </div>
  );
}
