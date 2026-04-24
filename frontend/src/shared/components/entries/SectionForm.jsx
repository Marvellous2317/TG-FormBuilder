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
  const entriesData = entry?.config?.items;

  return (
    <div className="mt-6 flex flex-col border border-secondary-200 w-full overflow-hidden">
      <h2 className="block w-full font-geist text-base font-medium text-secondary border-b border-secondary-200 px-4 py-4.5 bg-gray-50/50">
        {entry.name}
      </h2>
      {!entriesData || entriesData.length < 1 ? (
        <div className="flex justify-center py-10 px-4">
          <p className="text-sm font-semibold text-primary font-geist">
            No entries available
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-2 px-4 pb-5">
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
