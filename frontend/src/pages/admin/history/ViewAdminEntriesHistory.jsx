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
              <p className="text-sm text-primary-200 line-clamp-1">
                {configSummary}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}

// Image preview component for the admin history view
function ImagePreviewField({ entry, setFormData }) {
  const [imagePreview, setImagePreview] = useState(null);

  // Simulate image upload for preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          [entry.id]: { value: base64String },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      [entry.id]: { value: null },
    }));
    // Reset file input
    const fileInput = document.getElementById(`image-upload-${entry.id}`);
    if (fileInput) fileInput.value = '';
  };

  // const handleCameraCapture = () => {
  //   // Simulate camera capture for preview
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = 'image/*';
  //   input.capture = 'environment';
  //   input.onchange = (e) => handleImageUpload(e);
  //   input.click();
  // };

  return (
    <div className="w-full mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {entry.name}
        {entry.config?.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {entry.config?.instructions && (
        <p className="text-sm text-gray-500 mb-2">
          {entry.config.instructions}
        </p>
      )}

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
        id={`image-upload-${entry.id}`}
      />

      {imagePreview ? (
        // Show uploaded image with options
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt={entry.name}
            className="max-h-64 rounded-lg object-contain border border-gray-200"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() =>
                document.getElementById(`image-upload-${entry.id}`).click()
              }
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
              title="Replace image"
            >
              <FiUpload size={16} className="text-gray-600" />
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
              title="Remove image"
            >
              <FiX size={16} className="text-red-500" />
            </button>
          </div>
        </div>
      ) : (
        // Upload box
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              document.getElementById(`image-upload-${entry.id}`).click()
            }
            className="flex-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FiUpload size={20} className="text-gray-400" />
            <span className="text-sm text-gray-600">Upload Image</span>
          </button>

          {/* <button
            type="button"
            onClick={handleCameraCapture}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FiCamera size={20} className="text-gray-400" />
            <span className="text-sm text-gray-600">Take Photo</span>
          </button> */}
        </div>
      )}
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
          {/* Section Name - Readonly */}
          <div className="w-full">
            <label className="block text-sm font-medium text-secondary mb-1">
              Section name <span className="text-red-500">*</span>
            </label>
            <div className="w-full rounded-none border border-secondary-200 bg-tertiary-700 p-4 text-base text-primary">
              {sectionField.config?.name || sectionField.name}
            </div>
          </div>

          {/* Fields Table */}
          <div className="overflow-x-auto border w-full border-secondary-200 bg-white mt-4 rounded-[10px]">
            <div>
              {' '}
              <div className="min-w-205">
                {' '}
                <div className="grid grid-cols-[72px_minmax(0,1fr)_650px] border-b border-secondary-200 bg-white">
                  {' '}
                  <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                    {' '}
                  </div>{' '}
                  <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                    {' '}
                  </div>{' '}
                  <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                    {' '}
                  </div>{' '}
                </div>{' '}
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
                        className="grid grid-cols-[72px_minmax(0,1fr)_650px] border-b border-secondary-200 last:border-b-0 group"
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
                            {/* Show config summary if available */}
                            {item.config && (
                              <p className="text-sm text-primary-200 line-clamp-1">
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
                          <div className="w-[15%] flex items-center justify-between">
                            {/* Visibility indicator - matching CreateEntries */}
                            {item.config?.visible === false ? (
                              <IoEyeOff size={18} className="text-gray-400" />
                            ) : (
                              <IoEye size={18} className="text-gray-400" />
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
  const [isSectionOptionsModalOpen, setIsSectionOptionsModalOpen] =
    useState(false);

  const handleSectionClick = (field) => {
    setActiveSectionField(field);
    setIsSectionOptionsModalOpen(true);
  };

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
                <p className="text-white font-geist font-medium text-sm">
                  Entries view
                </p>
              ) : (
                <p className="text-white font-geist font-medium text-sm">
                  Preview Form
                </p>
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
                    <ImagePreviewField
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
