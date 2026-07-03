import React from 'react';
import InputField from '../InputField';

export default function BasicForm({ entry, formData, setFormData, readOnly }) {
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

  // const isNumber = entry?.type === 'number';

  // Get current value for this entry (if exists)
  let currentValue =
    formData[entryId]?.config?.defaultValue ||
    entry?.config?.defaultValue ||
    formData[entryId]?.value ||
    entry?.value ||
    '';

  const isVisible =
    entry?.config?.visible !== undefined ? entry?.config?.visible : true;
  if (!isVisible && ['number'].includes(entry.type)) return null;

  if (isVisible) {
    currentValue = formData[entryId]?.value || entry?.value || '';
  }

  return (
    <div className="mt-5 w-full">
      {!isVisible && currentValue ? (
        <p className="text-sm font-geist font-medium">{currentValue}</p>
      ) : (
        <InputField
          id={entryId}
          name={entryId}
          label={entry.name}
          type={entry.type}
          required={entry?.required}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleChange}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
