import React from 'react';
import BasicForm from './BasicForm';
import EnumForm from './EnumForm';
import DropdownForm from './DropdownForm';

export default function SectionForm({
  entry,
  formData,
  setFormData,
  readOnly,
}) {
  const entryId = entry?.entryId;

  const handleChange = (value) => {
    if (!entryId) return;

    setFormData((prev) => ({
      ...prev,
      [entryId]: {
        entryId: entryId,
        value: value,
      },
    }));
  };

  const currentValue = formData[entryId]?.value || entry?.value || '';

  const entriesData = entry?.config?.items;

  return (
    <div className="mt-5 flex flex-col border border-secondary-200 p-2 rounded-xl items-center justify-between w-full gap-2">
      <h2 className="block w-full font-geist text-sm font-regul text-secondary">
        {entry.name}
      </h2>
      {entriesData?.length < 1 ? (
        <div className="flex justify-center mt-20 px-4 md:px-10 lg:px-25">
          <p className="text-sm font-semibold text-primary font-geist">
            No entries available
          </p>
        </div>
      ) : (
        <div className="h-full mt-5 px-4">
          {entriesData
            ?.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map((entry) => {
              const entryKey = entry.id || entry.entryId || entry.name;
              return (
                <div key={entryKey} className="flex gap-2 w-full">
                  {(entry.type === 'text' ||
                    entry.type === 'date' ||
                    entry.type === 'time' ||
                    entry.type === 'number') && (
                    <BasicForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={readOnly}
                    />
                  )}
                  {entry.type === 'enum' && (
                    <EnumForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={readOnly}
                    />
                  )}
                  {entry.type === 'dropdown' && (
                    <DropdownForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={readOnly}
                    />
                  )}
                  {entry.type === 'section' && (
                    <SectionForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={readOnly}
                    />
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
