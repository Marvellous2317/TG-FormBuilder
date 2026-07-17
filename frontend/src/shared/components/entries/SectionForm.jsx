import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BasicForm from './BasicForm';
import EnumForm from './EnumForm';
import DropdownForm from './DropdownForm';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../Button';
import {
  evaluateFormula,
  formatComputedValue,
  parseSectionRows,
} from '../../utils/formula';

export default function SectionForm({
  entry,
  formData,
  setFormData,
  readOnly,
}) {
  const sectionEntryId = entry?.entryId || entry?.id || entry?.name;
  const entriesData = useMemo(
    () => entry?.config?.items || [],
    [entry?.config?.items],
  );
  const draftValue = formData?.[sectionEntryId]?.value;
  const initialRowsData = parseSectionRows(draftValue ?? entry?.value);

  const sortedEntries = useMemo(
    () => [...entriesData].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [entriesData],
  );

  const computeFormulaValue = useCallback(
    (entry, row) => {
      const expression = entry.config?.expression;
      if (!expression) return '';
      const scope = {};
      entriesData?.forEach((e) => {
        if (!e.config?.fieldRef) return;
        const fieldId = e.entryId || e.id;
        const rawValue =
          row?.[fieldId]?.value ?? e.value ?? e?.config?.defaultValue;
        if (rawValue === '' || rawValue == null) {
          scope[e.config.fieldRef] = 0;
        } else {
          const num = Number(rawValue);
          scope[e.config.fieldRef] = isNaN(num) ? String(rawValue) : num;
        }
      });

      const { value, error } = evaluateFormula(expression, scope);

      if (error || value == null) return 0;
      if (typeof value === 'object') return value?.entries[0];
      if (Array.isArray(value)) return value[0];
      if (typeof value === 'number') return isFinite(value) ? value : 0;
      if (typeof value === 'string') return value;
      return 0;
    },
    [entriesData],
  );

  const attachFormulaValuesToRow = useCallback(
    (row) => {
      const newRow = { ...row };
      sortedEntries
        .filter((field) => field.type === 'formular')
        .forEach((field) => {
          const fieldEntryId = field.entryId || field.id;
          newRow[fieldEntryId] = {
            entryId: fieldEntryId,
            value: String(
              formatComputedValue(computeFormulaValue(field, newRow)),
            ),
          };
        });
      return newRow;
    },
    [sortedEntries, computeFormulaValue],
  );

  // Local state owns the rows data so inputs update immediately without a parent round-trip
  const [rowsData, setRowsData] = useState(
    initialRowsData.map((row) => attachFormulaValuesToRow(row)),
  );

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
    setRowsData((prev) => [...prev, attachFormulaValuesToRow({})]);
  };

  const removeRow = (rowIndex) => {
    setRowsData((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  // Each row gets its own setFormData that writes into rowsData[rowIndex]
  const createRowSetFormData = (rowIndex) => (updater) => {
    setRowsData((prev) => {
      const newRows = [...prev];
      const updatedRow =
        typeof updater === 'function'
          ? updater(newRows[rowIndex] || {})
          : updater;
      newRows[rowIndex] = attachFormulaValuesToRow(updatedRow);
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
          {rowsData.map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`w-full flex flex-col px-4 pb-5 ${rowIndex > 0 ? 'border-t border-secondary-200 pt-3' : 'pt-2'}`}
            >
              {rowsData.length > 1 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-tertiary font-geist">
                    Row {rowIndex + 1}
                  </span>
                  {!readOnly && (
                    <Button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
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
                    const entryKey = `${field.id || field.entryId || field.name}__row_${rowIndex}`;
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
                              value: formatComputedValue(
                                computeFormulaValue(
                                  rowEntry,
                                  rowsData[rowIndex] || {},
                                ),
                              ),
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
