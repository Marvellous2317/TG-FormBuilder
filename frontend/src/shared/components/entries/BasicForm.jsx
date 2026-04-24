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

  // Get current value for this entry (if exists)
  const currentValue = formData[entryId]?.value || entry?.value || '';

  return (
    <div className="mt-5">
      <InputField
        id={entryId}
        name={entryId}
        label={entry.name}
        type={entry.type === 'text' ? 'textarea' : entry.type}
        required={entry?.required}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleChange}
        readOnly={readOnly}
      />
    </div>
  );
}
