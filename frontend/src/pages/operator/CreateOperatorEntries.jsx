import React, { useState, useEffect } from 'react';
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  useCreateOperatorChecklistEntries,
  useOperatorChecklist,
} from '../../shared/hooks/operator/useOperatorChecklists';
import { FaArrowLeft } from 'react-icons/fa';
import BasicForm from '../../shared/components/entries/BasicForm';
import EnumForm from '../../shared/components/entries/EnumForm';
import Button from '../../shared/components/Button';
import useToast from '../../shared/hooks/useToast';
import Loader from '../../shared/components/Loader';
import DropdownForm from '../../shared/components/entries/DropdownForm';
import SectionForm from '../../shared/components/entries/SectionForm';
import { queueSubmission } from '../../lib/offlineQueue';
import {
  evaluateFormula,
  formatComputedValue,
  parseSectionRows,
} from '../../shared/utils/formula';
import {
  saveToCache,
  getFromCache,
  getCacheTimestamp,
  saveDraft,
  getDraft,
  clearDraft,
} from '../../lib/offlineCache';
import CachedDataNotice from '../../shared/components/CachedDataNotice';
import { FiUpload, FiCamera, FiX } from 'react-icons/fi';

// Image upload component for operator
function ImageUploadField({ entry, formData, setFormData }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  // Load existing image from formData
  useEffect(() => {
    const existingValue = formData[entry.entryId]?.value;
    if (existingValue) {
      setImagePreview(existingValue);
    }
  }, [entry.entryId, formData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          [entry.entryId]: { entryId: entry.entryId, value: base64String },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // const handleCameraCapture = () => {
  //   // Use file input with capture attribute
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = 'image/*';
  //   input.capture = 'environment';
  //   input.onchange = (e) => {
  //     const file = e.target.files[0];
  //     if (file) {
  //       // Validate and process the file
  //       if (!file.type.startsWith('image/')) {
  //         setError('Please select an image file');
  //         return;
  //       }
  //       if (file.size > 5 * 1024 * 1024) {
  //         setError('Image size should be less than 5MB');
  //         return;
  //       }
  //       setError(null);
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         const base64String = reader.result;
  //         setImagePreview(base64String);
  //         setFormData(prev => ({
  //           ...prev,
  //           [entry.entryId]: { entryId: entry.entryId, value: base64String }
  //         }));
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   };
  //   input.click();
  // };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [entry.entryId]: { entryId: entry.entryId, value: null },
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please drop an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          [entry.entryId]: { entryId: entry.entryId, value: base64String },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const fileInputId = `image-upload-${entry.entryId || entry.id}`;

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
        onChange={handleFileChange}
        className="hidden "
        id={fileInputId}
      />

      {imagePreview ? (
        // Show uploaded image with options
        <div className="relative inline-block items-center justify-center ">
          <img
            src={imagePreview}
            alt={entry.name}
            className="max-h-64 rounded-lg object-contain border border-gray-200"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => document.getElementById(fileInputId).click()}
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
        // Upload box with drag and drop
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => document.getElementById(fileInputId).click()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-6 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
            >
              <FiUpload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600">Upload Image</span>
            </button>

            {/* <button
              type="button"
              onClick={handleCameraCapture}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-6 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
            >
              <FiCamera size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600">Take Photo</span>
            </button> */}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            or drag and drop an image here
          </p>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function CreateOperatorEntry() {
  let { id: checklistId } = useLoaderData();

  const { state } = useLocation();
  const checklistTitle = state?.title || '';

  const { mutateAsync: submitEntries, isPending: isSubmittingEntries } =
    useCreateOperatorChecklistEntries(checklistId);

  const navigate = useNavigate();

  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({});
  const [cachedChecklist, setCachedChecklist] = useState(null);
  const [cachedChecklistAt, setCachedChecklistAt] = useState(null);

  // Load cached checklist entries and any saved draft on mount
  useEffect(() => {
    getFromCache(`checklist-${checklistId}`).then(setCachedChecklist);
    getCacheTimestamp(`checklist-${checklistId}`).then(setCachedChecklistAt);
    getDraft(checklistId).then((draft) => {
      if (draft) setFormData(draft);
    });
  }, [checklistId]);

  // Auto-save draft whenever formData changes (debounced 500ms)
  useEffect(() => {
    if (Object.keys(formData).length === 0) return;
    const timer = setTimeout(() => saveDraft(checklistId, formData), 1000);
    return () => clearTimeout(timer);
  }, [formData, checklistId]);

  // When submitting, you can convert formData object to an array if needed:
  const handleSubmit = async () => {
    const enrichedFormData = { ...formData };

    entriesData
      ?.filter((e) => e.type === 'formular' || e.type === 'section_formular')
      .forEach((entry) => {
        enrichedFormData[entry.entryId] = {
          entryId: entry.entryId,
          value: String(
            formatComputedValue(
              entry.type === 'section_formular'
                ? computeSectionFormulaValue(entry)
                : computeFormulaValue(entry),
            ),
          ),
        };
      });

    const formDataArray = Object.values(enrichedFormData);

    if (!navigator.onLine) {
      await queueSubmission({ checklistId, payload: { data: formDataArray } });
      showSuccess('Saved offline — will sync when reconnected');
      return;
    }

    try {
      await submitEntries({ payload: { data: formDataArray } });
      showSuccess('Entries submitted successfully');
      await clearDraft(checklistId);
      setFormData({});
      navigate('/operator/');
    } catch (err) {
      console.log(err);
      const isNetworkError = !err.response;
      if (isNetworkError) {
        await queueSubmission({
          checklistId,
          payload: { data: formDataArray },
        });
        showSuccess('Saved offline — will sync when reconnected');
      } else {
        // showError('Something went wrong');
      }
    }

    console.log('Payload size:', JSON.stringify(formDataArray).length, 'bytes');
console.log('Sample entry:', formDataArray[0]);
  };

  const {
    data,
    isPending: isLoadingChecklistEntries,
    isPlaceholderData,
    isError,
  } = useOperatorChecklist(checklistId, {
    placeholderData: cachedChecklist,
  });

  const isUsingCache =
    isPlaceholderData || (isError && Boolean(cachedChecklist));

  useEffect(() => {
    if (data) saveToCache(`checklist-${checklistId}`, data);
  }, [data, checklistId]);

  const entriesData =
    data?.data?.assignment?.checklist?.entries ??
    cachedChecklist?.data?.assignment?.checklist?.entries;

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
    const rowsData = parseSectionRows(rawValue);
    if (!rowsData.length) return 0;

    const targetField = (sectionEntry.config?.items || []).find(
      (f) => f.name === fieldName,
    );
    if (!targetField) return 0;

    const targetFieldId = targetField.entryId || targetField.id;
    const sectionSubFields = sectionEntry.config?.items || [];

    const resolveRowValue = (row) => {
      const stored = row[targetFieldId]?.value;
      if (stored !== undefined && stored !== null && stored !== '') {
        const num = Number(stored);
        return isNaN(num) ? null : num;
      }

      if (targetField.type === 'formular') {
        const expression = targetField.config?.expression;
        if (!expression) return null;
        const scope = {};
        sectionSubFields.forEach((e) => {
          if (!e.config?.fieldRef) return;
          const fieldId = e.entryId || e.id;
          const rawVal =
            row[fieldId]?.value ?? e.value ?? e?.config?.defaultValue;
          if (rawVal === '' || rawVal == null) {
            scope[e.config.fieldRef] = 0;
          } else {
            const n = Number(rawVal);
            scope[e.config.fieldRef] = isNaN(n) ? String(rawVal) : n;
          }
        });
        const { value: fVal, error } = evaluateFormula(expression, scope);
        if (error || fVal == null) return null;
        const num = Number(fVal);
        return isNaN(num) ? null : num;
      }

      // Row hasn't been touched yet — fall back to the field's own
      // default/prefilled value instead of dropping it from the aggregate.
      const fallback = targetField.value ?? targetField.config?.defaultValue;
      if (fallback === undefined || fallback === null || fallback === '') {
        return null;
      }
      const num = Number(fallback);
      return isNaN(num) ? null : num;
    };

    const values = rowsData.map(resolveRowValue).filter((v) => v !== null);

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

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (!e.config?.fieldRef) return;
      const rawValue =
        formData[e.entryId]?.value ?? e.value ?? e?.config?.defaultValue;
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
  };

  return (
    <div
      className={`flex ${entriesData?.length > 0 ? 'min-h-screen' : ''} w-full flex-col bg-white py-6`}
    >
      <Link
        prefetch="intent"
        className="flex w-fit cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group px-4 md:px-10 lg:px-25"
        to="/operator/"
      >
        <FaArrowLeft
          className="text-primary-200 group-hover:-translate-x-0.5"
          size={16}
        />
        <p className="text-sm font-medium text-primary-200">
          Back to dashboard
        </p>
      </Link>

      <div className="flex items-center w-full md:my-2 my-4 md:text-lg text-base justify-center font-medium font-geist text-primary">
        <h2>{checklistTitle}</h2>
      </div>

      <div className="px-4 md:px-10 lg:px-25">
        <CachedDataNotice cachedAt={isUsingCache ? cachedChecklistAt : null} />
      </div>

      {isLoadingChecklistEntries ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : entriesData?.length < 1 ? (
        <div className="flex justify-center mt-20 px-4 md:px-10 lg:px-25">
          <p className="text-sm font-semibold text-primary font-geist">
            No entries available
          </p>
        </div>
      ) : (
        <div className="h-full mt-5 flex-1 px-4 md:px-10 lg:px-25">
          {entriesData
            ?.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map((entry) => {
              const entryKey = entry.id || entry.entryId || entry.name;
              return (
                <div key={entryKey} className="space-y-5 space-x-2">
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
                    <ImageUploadField
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                </div>
              );
            })}
        </div>
      )}

      {entriesData?.length > 0 && (
        <div className="border-t border-secondary-200 mt-6 pt-6 px-4 md:px-10 lg:px-25">
          <Button
            className="bg-primary-200 py-2.5 px-5 rounded-2xl text-base font-semibold text-white flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => handleSubmit()}
            disabled={isLoadingChecklistEntries}
          >
            Submit
            {isSubmittingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
          </Button>
        </div>
      )}
    </div>
  );
}
