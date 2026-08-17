import React from 'react';

export default function AdminTypeCard({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col rounded-xl border border-sop-200 px-6 py-5">
      {Icon ? <Icon className="text-lg text-sop-800" /> : null}
      <span className="mt-4 text-sm font-bold">{title}</span>
      <span className="mt-2 text-sm leading-6 text-sop-800">{description}</span>
    </div>
  );
}
