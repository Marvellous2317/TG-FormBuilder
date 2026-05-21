import React from 'react';
import InputField from '../InputField';

export default function EnumForm({
  entry,
  formData = {},
  setFormData,
  readOnly,
}) {
  const entryId = entry?.entryId;

  const handleChange = (event) => {
    const { value } = event.target;

    if (!entryId) return;

    setFormData((prev) => ({
      ...prev,
      [entryId]: {
        entryId: entryId,
        value: value,
      },
    }));
  };

  const splitOptions = entry?.config?.option?.split(/\s*\/\s*/);

  // Get current value for this entry (if exists)
  const currentValue = formData[entryId]?.value || entry?.value || '';

  const isVisible =
    entry?.config?.visible !== undefined ? entry?.config?.visible : true;
  if (!isVisible) return null;

  return (
    <div className="mt-5 flex w-full items-center justify-between gap-2">
      <h2 className="block font-geist text-sm font-regul text-secondary">
        {entry.name}
      </h2>
      <div className="flex gap-2 items-center">
        <div className="flex gap-2 items-center">
          <label
            htmlFor={`${entryId}-0`}
            className={`block font-geist text-sm font-regul text-secondary`}
          >
            {splitOptions[0] || 'Yes'}
          </label>

          <input
            type="radio"
            name={entryId}
            id={`${entryId}-0`}
            value={splitOptions[0]}
            onChange={handleChange}
            checked={currentValue === splitOptions[0]}
            disabled={readOnly}
            className="cursor-pointer"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label
            htmlFor={`${entryId}-1`}
            className={`block font-geist text-sm font-regul text-secondary`}
          >
            {splitOptions[1]}
          </label>

          <input
            type="radio"
            name={entryId}
            id={`${entryId}-1`}
            value={splitOptions[1] || 'No'}
            onChange={handleChange}
            checked={currentValue === splitOptions[1]}
            disabled={readOnly}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
