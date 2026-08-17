import React from 'react';

export default function StagePanel({ label, items = [] }) {
  return (
    <div className="rounded-xl bg-sop-300 px-6 py-5">
      <span className="text-sop-400 uppercase text-[11px] font-bold">
        {label}
      </span>
      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3">
        {items.map((item) => (
          <span key={item} className="flex items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sop-400" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
