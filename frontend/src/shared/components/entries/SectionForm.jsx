import React, { useState, useEffect, useRef } from 'react';
import BasicForm from './BasicForm';
import EnumForm from './EnumForm';
import DropdownForm from './DropdownForm';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../Button';
import { evaluateFormula } from '../../utils/formula';

const parseSectionRows = (value) => {
  if (!value) return [{}];

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{}];
  } catch (error) {
    console.log(error);
    return [{}];
  }
};

export default function SectionForm({
  entry,
  formData,
  setFormData,
  readOnly,
}) {
  const sectionEntryId = entry?.entryId || entry?.id || entry?.name;
  const entriesData = entry?.config?.items || [];
  const draftValue = formData?.[sectionEntryId]?.value;
  const initialRowsData = parseSectionRows(draftValue ?? entry?.value);

  const [rows, setRows] = useState(initialRowsData.map((_, i) => i));
  const [nextRowId, setNextRowId] = useState(
    initialRowsData.length > 0 ? initialRowsData.length : 1,
  );
  // Local state owns the rows data so inputs update immediately without a parent round-trip
  const [rowsData, setRowsData] = useState(initialRowsData);
  const rowsDataRef = useRef(rowsData);

  useEffect(() => {
    rowsDataRef.current = rowsData;
  }, [rowsData]);

  useEffect(() => {
    if (draftValue === undefined) return;

    const draftRowsData = parseSectionRows(draftValue);

    if (JSON.stringify(draftRowsData) === JSON.stringify(rowsDataRef.current)) {
      return;
    }

    setRows(draftRowsData.map((_, i) => i));
    setNextRowId(draftRowsData.length > 0 ? draftRowsData.length : 1);
    setRowsData(draftRowsData);
  }, [draftValue]);

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
      : { ...fieldWithEntryId, value: field?.value };
  };

  const sortedEntries = [...entriesData].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );

  const computeFormulaValue = (entry, rowIndex) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (e.type === 'number' && e.config?.fieldRef) {
        const rawValue =
          rowsData[rowIndex]?.[e.id]?.value ??
          e.value ??
          e?.config?.defaultValue;

        scope[e.config.fieldRef] =
          rawValue === '' || rawValue == null ? 0 : Number(rawValue);
      }
    });

    const { value, error } = evaluateFormula(expression, scope);
    if (error || (typeof value === 'number' && !isFinite(value))) {
      console.log(error);
      return 0;
    }
    return value ?? 0;
  };

  const isVisible =
    entry?.config?.visible !== undefined ? entry?.config?.visible : true;
  if (!isVisible) return null;

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
                {sortedEntries
                  .filter((e) => e.config?.visible !== false)
                  ?.map((field) => {
                    const rowEntry = getRowEntry(field, rowIndex);
                    const rowFormData =
                      rowsData[rowIndex] || formData[rowIndex] || {};
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
                        {field.type === 'formular' && (
                          <BasicForm
                            entry={{
                              ...rowEntry,
                              type: 'number',
                              value: (() => {
                                const anyNumberFieldEdited =
                                  sortedEntries?.some(
                                    (e) =>
                                      e.type === 'number' &&
                                      rowFormData[e.entryId] !== undefined,
                                  );
                                return anyNumberFieldEdited ||
                                  rowEntry.value == null ||
                                  rowEntry.value === ''
                                  ? computeFormulaValue(rowEntry, rowIndex)
                                  : rowEntry.value;
                              })(),
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
