import React from 'react';

export default function StagePanel({
  label,
  description,
  items = [],
  cards = [],
}) {
  return (
    <div className="rounded-xl bg-sop-300 px-6 py-5">
      <span className="text-sop-400 uppercase text-[11px] font-bold">
        {label}
      </span>

      {description && (
        <p className="mt-4 text-sm leading-6 text-sop-800">{description}</p>
      )}

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3">
          {items.map((item) => (
            <span key={item} className="flex items-center gap-2 text-sm">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sop-400" />
              {item}
            </span>
          ))}
        </div>
      )}

      {cards.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-xl border border-sop-200 bg-white px-5 py-4"
            >
              <span className="text-sm font-bold text-sop-400">
                {card.title}
              </span>
              <span className="mt-2 text-sm leading-6 text-sop-800">
                {card.description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
