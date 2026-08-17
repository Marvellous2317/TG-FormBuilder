import React from 'react';

export default function SOPHero({
  version = '1.0',
  preparedBy = 'Roseline Amarachi',
  appliesTo = 'Admin, Operator, Approver',
}) {
  const meta = [
    { label: 'version', value: version },
    { label: 'prepared by', value: preparedBy },
    { label: 'applies to', value: appliesTo },
  ];

  return (
    <section className="w-full mt-10 px-32">
      <div className="uppercase border rounded-full border-sop-400/25 bg-sop-400/8 text-sop-400 px-4 py-1.5 text-xs font-bold w-fit my-10">
        Controlled document
      </div>

      <h1 className="text-6xl font-extrabold flex flex-col mt-5">
        <span>Standard</span>
        <span className="text-sop-400">Operating</span>
        <span>Procedure</span>
      </h1>

      <p className="text-sop-800 mt-4.5">Digital Forms and Logbook Application.</p>

      <div className="mt-9 border-sop-200 rounded-xl border flex w-full">
        {meta.map((item, idx) => (
          <div
            key={item.label}
            className={`flex flex-col pt-4 pl-5 w-full h-22.75 ${
              idx < meta.length - 1 ? 'border-r border-sop-200' : ''
            } ${idx % 2 === 0 ? 'bg-sop-300' : ''}`}
          >
            <span className="font-bold text-sop-100 uppercase text-xs">
              {item.label}
            </span>
            <span className="text-sop-800 font-bold text-sm">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
