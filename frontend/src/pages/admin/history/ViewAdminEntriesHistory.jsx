import React, { useState } from 'react';
import { useLoaderData, Link, useSearchParams } from 'react-router-dom';
import {
  evaluateFormula,
  formatComputedValue,
} from '../../../shared/utils/formula';
import { useChecklistsVersion } from '../../../shared/hooks/admin/useChecklist';
import { FaArrowLeft } from 'react-icons/fa';
import { FaEye, FaPen } from 'react-icons/fa6';
import BasicForm from '../../../shared/components/entries/BasicForm';
import EnumForm from '../../../shared/components/entries/EnumForm';
import DropdownForm from '../../../shared/components/entries/DropdownForm';
import SectionForm from '../../../shared/components/entries/SectionForm';
import Button from '../../../shared/components/Button';
import Loader from '../../../shared/components/Loader';
import { fieldTypeOptions } from '../../../shared/utils/constants';
import { IoEye, IoEyeOff, IoClose } from 'react-icons/io5';
import { FiUpload, FiCamera, FiX } from 'react-icons/fi';
import Modal from '../../../shared/components/Modal';
import InputField from '../../../shared/components/InputField';
import ImageForm from '../../../shared/components/entries/ImageForm';

function ReadOnlyFieldRow({ field, index, onSectionClick }) {
  const typeLabel =
    fieldTypeOptions.find((opt) => opt.value === field.type)?.label ||
    field.type;

  const configSummary = (() => {
    switch (field.type) {
      case 'dropdown':
        return field.config?.title;
      case 'enum':
        return field.config?.option;
      case 'section':
        return field.config?.name;
      case 'formular':
        return field.config?.expression || 'Formular';
      case 'section_formular':
        return field.config?.name || 'SF';
      default:
        return null;
    }
  })();

  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)_650px] border-b border-secondary-200 last:border-b-0">
      <div className="flex items-center gap-2 border-r border-secondary-200 px-4 py-2.5 text-secondary">
        <span className="text-sm">{index + 1}</span>
      </div>

      <div className="border-r border-secondary-200 px-4 py-2.5">
        <div className="w-full truncate rounded-none border-0 bg-tertiary-700 p-4 text-base text-primary">
          {field.name}
        </div>
      </div>

      <div className="border-r flex items-center justify-between w-full border-secondary-200 px-4 py-2.5">
        <div className="w-[50%]">
          <div className="w-full truncate rounded-none border-0 bg-tertiary-700 p-4 text-base text-primary">
            {typeLabel}
          </div>
        </div>
        <div className="w-[45%]">
          {configSummary &&
            (field.type === 'section' ? (
              <p
                onClick={() => onSectionClick(field)}
                className="cursor-pointer text-sm text-primary-200 underline line-clamp-1"
              >
                {configSummary}
              </p>
            ) : (
              <p 
              onClick={() => onSectionClick(field)}
              className="cursor-pointer underline text-sm text-primary-200 line-clamp-1">
                {configSummary}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}


function EntriesTableView({ entriesData, onSectionClick }) {
  const sortedFields = [...(entriesData || [])].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );

  return (
    <div className="h-full mt-5 flex-1 px-4 md:px-10 lg:px-25">
      <div className="overflow-x-auto border border-secondary-200 bg-white">
        <div className="min-w-205">
          <div className="grid grid-cols-[72px_minmax(0,1fr)_650px] border-b border-secondary-200 bg-white">
            <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
              #
            </div>
            <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
              Name
            </div>
            <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
              Type
            </div>
          </div>

          {sortedFields.map((field, index) => {
            const key = field.id || field.entryId || field.name;
            return (
              <ReadOnlyFieldRow
                key={key}
                field={field}
                index={index}
                onSectionClick={onSectionClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReadOnlySectionOptionsModal({ isOpen, onClose, sectionField }) {
  if (!isOpen || !sectionField) return null;

  const items = sectionField.config?.items || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      width="max-w-[800px]"
    >
      <div className="flex h-full flex-col overflow-auto">
        <div className="space-y-0.5 p-5 border-b border-secondary-200">
          <p className="text-base font-semibold font-geist text-primary">
            Section
          </p>
          <p className="text-sm font-geist text-tertiary">
            Enter your section details
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center py-6 px-5">
          <InputField
            type="text"
            label="Section name"
            id="sectionName"
            placeholder="Section name"
            value={sectionField.config?.name || sectionField.name}
            readOnly
          />

          {/* Fields Table */}
          <div className="overflow-x-auto border w-full border-secondary-200 bg-white mt-4 rounded-[10px]">
            <div className="min-w-full">
              <div className="grid grid-cols-[63px_minmax(0,1fr)_400px] border-b border-secondary-200 bg-white">
                <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                  #
                </div>
                <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                  Name
                </div>
                <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                  Type
                </div>
              </div>

              {items.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-tertiary">
                  No fields in this section
                </div>
              ) : (
                items.map((item, index) => {
                  const typeLabel =
                    fieldTypeOptions.find((opt) => opt.value === item.type)
                      ?.label || item.type;

                  return (
                    <div
                      key={item.id || item.entryId || index}
                      className="grid grid-cols-[63px_minmax(0,1fr)_400px] border-b border-secondary-200 last:border-b-0 group"
                    >
                      <div className="flex items-center gap-2 border-r border-secondary-200 px-4 py-2.5 text-secondary">
                        <span className="text-sm">{index + 1}</span>
                      </div>

                      <div className="border-r border-secondary-200 px-4 py-2.5">
                        <div className="w-full truncate rounded-none border-0 bg-tertiary-700 p-4 text-base text-primary">
                          {item.name}
                        </div>
                      </div>

                      <div className="border-r flex items-center justify-between w-full border-secondary-200 px-4 py-2.5">
                        <div className="w-[50%]">
                          <div className="w-full truncate rounded-none border-0 bg-tertiary-700 p-4 text-base text-primary">
                            {typeLabel}
                          </div>
                        </div>
                        <div className="w-[20%]">
                          {item.config && (
                            <p className="text-sm text-primary-200 line-clamp-1 cursor-pointer">
                              {item.type === 'dropdown' && item.config.title}
                              {item.type === 'enum' && item.config.option}
                              {item.type === 'formular' &&
                                (item.config.expression || 'Formular')}
                              {item.type === 'section_formular' &&
                                (item.config.name || 'SF')}
                              {item.type === 'number' &&
                                !item.config.visible &&
                                item.config.defaultValue}
                              {item.type === 'text' &&
                                !item.config.visible &&
                                item.config.defaultValue}
                            </p>
                          )}
                        </div>
                       
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      

        <div className="flex items-center mt-6 p-5 border-t border-secondary-200 justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function ViewAdminEntriesHistory() {
  let { id: checklistId, versionId } = useLoaderData();

  const [searchParams] = useSearchParams();
  const checklistTitle = searchParams.get('title');

  const { data, isPending } = useChecklistsVersion(checklistId, versionId);

  const [formData, setFormData] = useState({});
  const [isPreview, setIsPreview] = useState(false);
  const [activeSectionField, setActiveSectionField] = useState(null);
  const handleSectionClick = (field) => {
    setActiveSectionField(field);
    setIsSectionOptionsModalOpen(true);
  };
  const [isSectionOptionsModalOpen, setIsSectionOptionsModalOpen] =
    useState(false);

  const entriesData = data?.data?.version?.entries;

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (e.config?.fieldRef) {
        const rawValue =
          formData[e.entryId]?.value ?? e.value ?? e?.config?.defaultValue;

        if (rawValue === '' || rawValue == null) {
          scope[e.config.fieldRef] = 0;
        } else {
          const num = Number(rawValue);
          scope[e.config.fieldRef] = isNaN(num) ? String(rawValue) : num;
        }
      }
    });
    const { value, error } = evaluateFormula(expression, scope);
    if (error || (typeof value === 'number' && !isFinite(value))) {
      console.log(error);
      return 0;
    }

    return value ?? 0;
  };

  const computeSectionFormulaValue = (entry) => {
    const {
      section: sectionName,
      field: fieldName,
      operation,
    } = entry.config?.items || {};
    if (!sectionName || !fieldName || !operation) return 0;

    const sectionEntry = entriesData?.find(
      (e) => e.type === 'section' && e.name === sectionName,
    );
    if (!sectionEntry) return 0;

    const sectionEntryId =
      sectionEntry.entryId || sectionEntry.id || sectionEntry.name;
    const rawValue = formData[sectionEntryId]?.value ?? sectionEntry?.value;
    const rowsData = JSON.parse(rawValue || '[]');
    if (!rowsData.length) return 0;

    const targetField = (sectionEntry.config?.items || []).find(
      (f) => f.name === fieldName,
    );
    if (!targetField) return 0;

    const targetFieldId = targetField.entryId || targetField.id;
    const values = rowsData
      .map((row) => {
        const raw = row[targetFieldId]?.value;
        const num = Number(raw);
        return isNaN(num) ? null : num;
      })
      .filter((v) => v !== null);

    if (!values.length) return 0;

    switch (operation.toLowerCase()) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'subtract':
        return values.reduce((a, b) => a - b);
      case 'multiply':
        return values.reduce((a, b) => a * b, 1);
      case 'average':
      case 'mean':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'median': {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      }
      case 'mode': {
        const freq = {};
        let maxFreq = 0;
        let mode = values[0];
        values.forEach((v) => {
          freq[v] = (freq[v] || 0) + 1;
          if (freq[v] > maxFreq) {
            maxFreq = freq[v];
            mode = v;
          }
        });
        return mode;
      }
      default:
        return 0;
    }
  };

  return (
    <div
      className={`flex ${entriesData?.length > 0 ? 'min-h-screen' : ''} w-full flex-col overflow-y-auto bg-white py-6`}
    >
      <div className="flex items-center w-full px-4 pb-2.5 border-b border-secondary-200">
        <Link
          prefetch="intent"
          className="flex w-1/3 cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group "
          to={`/admin/entries/${checklistId}/history/`}
        >
          <FaArrowLeft
            className="text-primary-200 group-hover:-translate-x-0.5"
            size={16}
          />
          <p className="text-sm font-medium text-primary-200">
            Back to history
          </p>
        </Link>

        <h1 className="flex items-center justify-start md:justify-center w-1/3 text-base mt-4 md:mt-0 lg:text-lg font-semibold text-primary font-geist">
          {checklistTitle}
        </h1>

        <div className="flex w-1/3 items-center justify-end">
          {entriesData?.length > 0 && (
            <Button
              type="button"
              onClick={() => setIsPreview((prev) => !prev)}
              className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
            >
              {isPreview ? (
                <>
                  <p className="text-white font-geist font-medium text-sm">
                    {' '}
                    Entries view
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white font-geist font-medium text-sm">
                    Preview Form
                  </p>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {isPending ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : entriesData?.length < 1 ? (
        <div className="flex justify-center mt-20 px-4 md:px-10 lg:px-25">
          <p className="text-sm font-semibold text-primary font-geist">
            No entries available
          </p>
        </div>
      ) : isPreview ? (
        <div className="h-full mt-5 flex-1 px-4 md:px-10 lg:px-25">
          {entriesData
            ?.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map((entry) => {
              const entryKey = entry.id || entry.entryId || entry.name;

              return (
                <div key={entryKey} className="space-y-5">
                  {(entry.type === 'text' ||
                    entry.type === 'date' ||
                    entry.type === 'time' ||
                    entry.type === 'number') && (
                    <BasicForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                  {entry.type === 'enum' && (
                    <EnumForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                  {entry.type === 'dropdown' && (
                    <DropdownForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                  {entry.type === 'section' && (
                    <SectionForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                  {entry.type === 'formular' && (
                    <BasicForm
                      entry={{
                        ...entry,
                        type: 'number',
                        value: formatComputedValue(computeFormulaValue(entry)),
                      }}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly
                    />
                  )}

                  {entry.type === 'section_formular' && (
                    <BasicForm
                      entry={{
                        ...entry,
                        type: 'number',
                        value: formatComputedValue(
                          computeSectionFormulaValue(entry),
                        ),
                      }}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly
                    />
                  )}
                  {entry.type === 'image' && (
                    <ImageForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <EntriesTableView
          entriesData={entriesData}
          onSectionClick={handleSectionClick}
        />
      )}

      <ReadOnlySectionOptionsModal
        isOpen={isSectionOptionsModalOpen}
        onClose={() => {
          setIsSectionOptionsModalOpen(false);
          setActiveSectionField(null);
        }}
        sectionField={activeSectionField}
      />
    </div>
  );
}
