import React, { useState, useEffect } from 'react';
import BasicForm from './BasicForm';
import EnumForm from './EnumForm';
import DropdownForm from './DropdownForm';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../Button';
import { evaluateFormula } from '../../utils/formula';

export default function SectionForm({ entry, setFormData, readOnly }) {
  const sectionEntryId = entry?.entryId || entry?.id || entry?.name;
  const entriesData = entry?.config?.items;

  const entriesRecords = JSON.parse(entry?.value ? entry?.value : '[]');

  const [rows, setRows] = useState(
    entriesRecords && entriesRecords.length > 0
      ? entriesRecords.map((_, i) => i)
      : [0],
  );
  const [nextRowId, setNextRowId] = useState(
    entriesRecords?.length > 0 ? entriesRecords.length : 1,
  );
  // Local state owns the rows data so inputs update immediately without a parent round-trip
  const [rowsData, setRowsData] = useState(entriesRecords || [{}]);

  // Sync local rowsData up to parent formData after every change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      [sectionEntryId]: {
        entryId: sectionEntryId,
        value: JSON.stringify(rowsData),
      },
    }));
  }, [rowsData, sectionEntryId, setFormData]);

  const addRow = () => {
    setRows((prev) => [...prev, nextRowId]);
    setNextRowId((prev) => prev + 1);
    setRowsData((prev) => [...prev, {}]);
  };

  const removeRow = (rowId) => {
    const rowIndex = rows.indexOf(rowId);
    setRows((prev) => prev.filter((r) => r !== rowId));
    setRowsData((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  // Each row gets its own setFormData that writes into rowsData[rowIndex]
  const createRowSetFormData = (rowIndex) => (updater) => {
    setRowsData((prev) => {
      const newRows = [...prev];
      newRows[rowIndex] =
        typeof updater === 'function'
          ? updater(newRows[rowIndex] || {})
          : updater;
      return newRows;
    });
  };

  // Ensure entryId is always set (section sub-fields are created with `id`, not `entryId`)
  const getRowEntry = (field, rowIndex) => {
    const fieldWithEntryId = { ...field, entryId: field.entryId || field.id };
    return rowIndex === 0
      ? fieldWithEntryId
      : { ...fieldWithEntryId, value: '' };
  };

  const sortedEntries = entriesData
    ?.slice()
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (e.type === 'number' && e.config?.fieldRef) {
        scope[e.config.fieldRef] = rowsData[e.entryId]?.value ?? e.value ?? '';
      }
    });
    const { value, error } = evaluateFormula(expression, scope);
    return error ? 'Invalid formula' : (value ?? '');
  };

  return (
    <div className="mt-6 flex flex-col border border-secondary-200 w-full overflow-hidden">
      <h2 className="block w-full font-geist text-base font-medium text-secondary border-b border-secondary-200 px-4 py-4.5 bg-gray-50/50">
        {entry.name} - {entry?.config?.name}
      </h2>
      {!entriesData || entriesData.length < 1 ? (
        <div className="flex justify-center py-10 px-4">
          <p className="text-sm font-semibold text-primary font-geist">
            No entries available
          </p>
        </div>
      ) : (
        <>
          {rows.map((rowId, rowIndex) => (
            <div
              key={rowId}
              className={`w-full flex flex-col px-4 pb-5 ${rowIndex > 0 ? 'border-t border-secondary-200 pt-3' : 'pt-2'}`}
            >
              {rows.length > 1 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-tertiary font-geist">
                    Row {rowIndex + 1}
                  </span>
                  {!readOnly && (
                    <Button
                      type="button"
                      onClick={() => removeRow(rowId)}
                      className="flex items-center gap-1 text-xs text-red-500 transition-colors"
                    >
                      <FiTrash2 size={13} />
                      Remove
                    </Button>
                  )}
                </div>
              )}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] xl:grid-cols-4 gap-x-4 gap-y-1 w-full overflow-y-auto">
                {sortedEntries?.map((field) => {
                  const rowEntry = getRowEntry(field, rowIndex);
                  const rowFormData = rowsData[rowIndex] || {};
                  const rowSetFormData = createRowSetFormData(rowIndex);
                  const entryKey = `${field.id || field.entryId || field.name}__row_${rowId}`;
                  return (
                    <div key={entryKey} className="flex-1 min-w-40">
                      {(field.type === 'text' ||
                        field.type === 'date' ||
                        field.type === 'time' ||
                        field.type === 'number') && (
                        <BasicForm
                          entry={rowEntry}
                          formData={rowFormData}
                          setFormData={rowSetFormData}
                          readOnly={readOnly}
                        />
                      )}
                      {field.type === 'enum' && (
                        <EnumForm
                          entry={rowEntry}
                          formData={rowFormData}
                          setFormData={rowSetFormData}
                          readOnly={readOnly}
                        />
                      )}
                      {field.type === 'dropdown' && (
                        <DropdownForm
                          entry={rowEntry}
                          formData={rowFormData}
                          setFormData={rowSetFormData}
                          readOnly={readOnly}
                        />
                      )}
                      {entry.type === 'formular' && (
                        <BasicForm
                          entry={{
                            ...rowEntry,
                            type: 'number',
                            value: computeFormulaValue(rowEntry),
                          }}
                          formData={rowFormData}
                          setFormData={rowSetFormData}
                          readOnly
                        />
                      )}
                      {/* {field.type === 'section' && (
                        <SectionForm
                          entry={rowEntry}
                          formData={rowFormData}
                          setFormData={rowSetFormData}
                          readOnly={readOnly}
                        />
                      )} */}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {!readOnly && (
            <div className="border-t border-secondary-200 px-4 py-3">
              <Button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-200 transition-colors"
              >
                <FiPlus size={15} />
                Add row
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
