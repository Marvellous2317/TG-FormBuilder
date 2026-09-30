import React, { useEffect } from 'react';

export default function EnumForm({
  entry,
  formData = {},
  setFormData,
  readOnly,
  inputKey,
}) {
  const entryId = entry?.entryId;

  const inputName = inputKey || entryId;

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

  // Ensure a prefilled/default value is included in formData even if the
  // user never edits the field, so it still gets submitted.
  useEffect(() => {
    if (!entryId) return;
    if (formData[entryId] !== undefined) return;
    if (!currentValue) return;

    setFormData((prev) => ({
      ...prev,
      [entryId]: {
        entryId,
        value: currentValue,
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId, currentValue, formData[entryId]]);

  if (!isVisible) return null;

  return (
    <div className="mt-5 flex w-full items-center justify-between gap-2">
      <h2 className="block font-geist text-sm text-secondary">{entry.name}</h2>
      <div className="flex gap-2 items-center">
        <div className="flex gap-2 items-center">
          <label
            htmlFor={`${inputName}-0`}
            className={`block font-geist text-sm text-secondary`}
          >
            {splitOptions[0] || 'Yes'}
          </label>

          <input
            type="radio"
            name={inputName}
            id={`${inputName}-0`}
            value={splitOptions[0] || 'Yes'}
            onChange={handleChange}
            checked={currentValue === splitOptions[0]}
            disabled={readOnly}
            className="cursor-pointer"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label
            htmlFor={`${inputName}-1`}
            className={`block font-geist text-sm text-secondary`}
          >
            {splitOptions[1] || 'No'}
          </label>

          <input
            type="radio"
            name={inputName}
            id={`${inputName}-1`}
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
