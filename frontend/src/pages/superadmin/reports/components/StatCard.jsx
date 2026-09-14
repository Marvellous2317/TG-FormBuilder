import React from 'react';
import Loader from '../../../../shared/components/Loader';

const StatCard = ({ label, value, loading = false }) => {
  return (
    <div className="flex w-full flex-col gap-2 p-5 border border-secondary-200 rounded-2xl transition-all duration-150 ease-in-out hover:bg-gray-100/35">
      <h1 className="text-sm font-geist text-tertiary">{label}</h1>
      <h1 className="text-primary font-medium font-geist text-3xl">
        {loading ? <Loader /> : value ?? 0}
      </h1>
    </div>
  );
};

export default StatCard;
