import React from 'react';

export default function StepTimeline({ steps = [] }) {
  return (
    <div className="mt-9 relative flex flex-col gap-7">
      <span className="absolute left-3 top-3 bottom-3 w-px bg-sop-200" />
      {steps.map((step, idx) => (
        <div key={step.title} className="relative z-10 flex gap-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sop-400 text-xs font-bold text-white">
            {idx + 1}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold">{step.title}</span>
            {step.description && (
              <span className="mt-1 text-sm text-sop-800">
                {step.description}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
