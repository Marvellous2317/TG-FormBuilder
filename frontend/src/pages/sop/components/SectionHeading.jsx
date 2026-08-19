import React from 'react';

export default function SectionHeading({ number, title, badge }) {
  return (
    <div className="flex flex-col">
      {badge ? (
        <div className="flex items-center gap-3">
          <span className="text-sop-400 text-sm font-bold">{number}</span>
          <span className="uppercase border rounded-full border-sop-400/25 bg-sop-400/8 text-sop-400 px-3 py-1 text-[11px] font-bold">
            {badge}
          </span>
        </div>
      ) : (
        <span className="text-sop-400 text-sm font-bold">{number}</span>
      )}
      <span className="font-extrabold my-2.5 text-4xl">{title}</span>
      <span className="w-9 border-sop-400 rounded-full border-2"></span>
    </div>
  );
}
