import React from 'react';

export default function SubSectionHeading({ id, number, title }) {
  return (
    <div id={id} className="flex items-center gap-3 scroll-mt-6">
      <span className="text-sop-100 text-xs font-bold">{number}</span>
      <span className="text-2xl font-extrabold">{title}</span>
    </div>
  );
}
