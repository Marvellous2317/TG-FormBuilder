import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

export default function SOPTopBar({
  brand = 'Digiforms',
  title = 'Digiforms Training Document',
  version = 'VERSION 1.0',
}) {
  return (
    <section className="flex items-center justify-between w-full px-10 py-3.5 border-b border-sop-200">
      <p className="flex items-center gap-2">
        <span className="font-bold text-sop-400 text-sm">{brand}</span>
        <FaChevronRight className="text-sop-100 m-1" size={12} />
        <span className=" text-sop-100 text-sm">{title}</span>
      </p>

      <p className="font-bold text-sm text-sop-100 mx-4 my-1">{version}</p>
    </section>
  );
}
