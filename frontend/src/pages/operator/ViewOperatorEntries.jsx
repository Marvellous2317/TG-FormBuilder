import React, { useState, useEffect } from 'react';
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  useOperatorSubmittedChecklist,
  useUpdateOperatorChecklistEntries,
} from '../../shared/hooks/operator/useOperatorChecklists';
import BasicForm from '../../shared/components/entries/BasicForm';
import { FaArrowLeft } from 'react-icons/fa';
import { FiUpload, FiCamera, FiX } from 'react-icons/fi';
import Loader from '../../shared/components/Loader';
import EnumForm from '../../shared/components/entries/EnumForm';
import DropdownForm from '../../shared/components/entries/DropdownForm';
import SectionForm from '../../shared/components/entries/SectionForm';
import useToast from '../../shared/hooks/useToast';
import Button from '../../shared/components/Button';
import {
  evaluateFormula,
  formatComputedValue,
} from '../../shared/utils/formula';
import { useAuthStore } from '../../shared/store/authStore';
import SignatureModal from '../approver/components/SignatureModal';
import {
  saveToCache,
  getFromCache,
  getCacheTimestamp,
} from '../../lib/offlineCache';
import CachedDataNotice from '../../shared/components/CachedDataNotice';
import ImageForm from '../../shared/components/entries/ImageForm';

// Image upload component for viewing/editing
function ImageViewField({ entry, formData, setFormData, readOnly }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  // Load existing image from formData or entry value
  useEffect(() => {
    const existingValue = formData[entry.entryId]?.value || entry?.value;
    if (existingValue) {
      setImagePreview(existingValue);
    }
  }, [entry.entryId, formData, entry?.value]);

  const handleFileChange = (e) => {
    if (readOnly) return;
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
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

  const handleCameraCapture = () => {
    if (readOnly) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          setError('Please select an image file');
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
    input.click();
  };

  const handleRemoveImage = () => {
    if (readOnly) return;
    setImagePreview(null);
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [entry.entryId]: { entryId: entry.entryId, value: null },
    }));
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
        className="hidden"
        id={fileInputId}
        disabled={readOnly}
      />

      {imagePreview ? (
        // Show uploaded image with options
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt={entry.name}
            className="max-h-64 rounded-lg object-contain border border-gray-200"
          />
          {!readOnly && (
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
          )}
        </div>
      ) : (
        // Upload box (or read-only message)
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          {readOnly ? (
            <div className="text-center">
              <p className="text-sm text-gray-400">No image uploaded</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById(fileInputId).click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-6 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                >
                  <FiUpload size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Upload Image</span>
                </button>

                <button
                  type="button"
                  onClick={handleCameraCapture}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-6 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                >
                  <FiCamera size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Take Photo</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                or drag and drop an image here
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function ViewOperatorEntries() {
  let { id: checklistId } = useLoaderData();

  const { state } = useLocation();
  const { title: checklistTitle, previousLocation } = state;

  const { user } = useAuthStore();

  const [cachedSubmission, setCachedSubmission] = useState(null);
  const [cachedSubmissionAt, setCachedSubmissionAt] = useState(null);

  useEffect(() => {
    getFromCache(`submission-${checklistId}`).then(setCachedSubmission);
    getCacheTimestamp(`submission-${checklistId}`).then(setCachedSubmissionAt);
  }, [checklistId]);

  const {
    data,
    isPending: isLoadingChecklistEntries,
    isPlaceholderData,
    isError,
  } = useOperatorSubmittedChecklist(checklistId, {
    placeholderData: cachedSubmission,
  });

  const isUsingCache =
    isPlaceholderData || (isError && Boolean(cachedSubmission));

  useEffect(() => {
    if (data) saveToCache(`submission-${checklistId}`, data);
  }, [data, checklistId]);

  const navigate = useNavigate();

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const [formData, setFormData] = useState({});

  const { showSuccess, showError } = useToast();

  const entriesData =
    data?.data?.submission?.entries ??
    cachedSubmission?.data?.submission?.entries;

  const approver =
    data?.data?.submission?.approver ??
    cachedSubmission?.data?.submission?.approver;

  const submittedId =
    data?.data?.submission?.submittedChecklistId ??
    cachedSubmission?.data?.submission?.submittedChecklistId;

  const { mutateAsync: updateEntries, isPending: isUpdatingEntries } =
    useUpdateOperatorChecklistEntries(submittedId);

  const handleUpdate = async () => {
    const formDataArray = Object.values(formData);

    if (!user.signature) {
      showError('Signature is required. Please add a signature.');
      setIsSignatureModalOpen(true);
      return;
    }

    try {
      await updateEntries({ payload: { data: formDataArray } });
      showSuccess('Entries updated successfully');
      setFormData({});
      navigate('/operator/');
    } catch (err) {
      console.log(err);
    }
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
    let rowsData;
    try {
      rowsData = JSON.parse(rawValue || '[]');
    } catch {
      rowsData = [];
    }
    if (!rowsData.length) return 0;

    const targetField = (sectionEntry.config?.items || []).find(
      (f) => f.name === fieldName,
    );
    if (!targetField) return 0;

    const targetFieldId = targetField.entryId || targetField.id;
    const sectionSubFields = sectionEntry.config?.items || [];

    const resolveRowValue = (row) => {
      const raw = row[targetFieldId]?.value;
      if (raw !== undefined && raw !== null && raw !== '') {
        const num = Number(raw);
        return isNaN(num) ? null : num;
      }

      if (targetField.type === 'formular') {
        const expression = targetField.config?.expression;
        if (!expression) return null;
        const scope = {};
        sectionSubFields.forEach((e) => {
          if (!e.config?.fieldRef) return;
          const fieldId = e.entryId || e.id;
          const rawValue =
            row[fieldId]?.value ?? e.value ?? e?.config?.defaultValue;
          if (rawValue === '' || rawValue == null) {
            scope[e.config.fieldRef] = 0;
          } else {
            const num = Number(rawValue);
            scope[e.config.fieldRef] = isNaN(num) ? String(rawValue) : num;
          }
        });
        const { value, error } = evaluateFormula(expression, scope);
        if (error || value == null) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      }

      return null;
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

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Sticky header */}

      <Link
        prefetch="intent"
        className="flex w-fit cursor-pointer items-center gap-2 py-4 transition-all duration-150 ease-in-out group px-4 md:px-10 lg:px-25"
        to={previousLocation ? `/operator/${previousLocation}` : '/operator'}
      >
        <FaArrowLeft
          className="text-primary-200 group-hover:-translate-x-0.5"
          size={16}
        />
        <p className="text-sm font-medium text-primary-200">
          {previousLocation
            ? `Back to ${previousLocation}`
            : 'Back to dashboard'}
        </p>
      </Link>

      <div className="flex items-center w-full md:my-2 my-4 md:text-lg text-base justify-center font-medium font-geist text-primary">
        <h2>{checklistTitle}</h2>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-25">
        <CachedDataNotice cachedAt={isUsingCache ? cachedSubmissionAt : null} />
        {isLoadingChecklistEntries ? (
          <Loader size="h-12 w-12 !border-primary-200 mt-20" />
        ) : entriesData?.length < 1 ? (
          <div className="flex justify-center mt-20">
            <p className="text-sm font-semibold text-primary font-geist">
              No entries available
            </p>
          </div>
        ) : (
          <div className="mt-5">
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
                        readOnly={previousLocation === 'pending' ? false : true}
                      />
                    )}
                    {entry.type === 'enum' && (
                      <EnumForm
                        entry={entry}
                        formData={formData}
                        setFormData={setFormData}
                        readOnly={previousLocation === 'pending' ? false : true}
                      />
                    )}
                    {entry.type === 'dropdown' && (
                      <DropdownForm
                        entry={entry}
                        formData={formData}
                        setFormData={setFormData}
                        readOnly={previousLocation === 'pending' ? false : true}
                      />
                    )}
                    {entry.type === 'section' && (
                      <SectionForm
                        entry={entry}
                        formData={formData}
                        setFormData={setFormData}
                        readOnly={previousLocation === 'pending' ? false : true}
                      />
                    )}
                    {entry.type === 'formular' && (
                      <BasicForm
                        entry={{
                          ...entry,
                          type: 'number',
                          value: formatComputedValue(
                            computeFormulaValue(entry),
                          ),
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
                        readOnly={previousLocation === 'pending' ? false : true}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {previousLocation !== 'pending' && (
        <div className="shrink-0 border-t border-secondary-200 flex items-center w-full bg-white py-4 px-4 md:px-10 lg:px-25">
          <h2 className="w-1/2 text-primary text-sm font-medium">Checked by</h2>
          <div className="flex w-1/2 flex-col items-start gap-1">
            <h2 className="text-primary text-sm font-medium">
              {approver?.firstName} {approver?.lastName}
            </h2>
            <p className="text-tertiary text-xs">Approver</p>
          </div>
        </div>
      )}

      {/* Sticky footer */}
      {!isLoadingChecklistEntries && previousLocation === 'pending' && (
        <div className="shrink-0 border-t border-secondary-200 bg-white py-4 px-4 md:px-10 lg:px-25">
          <Button
            className="bg-primary-200 py-2.5 px-5 rounded-2xl text-sm lg:text-base font-semibold text-white flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => handleUpdate()}
            disabled={isLoadingChecklistEntries || isUpdatingEntries}
          >
            Update
            {isUpdatingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
          </Button>
        </div>
      )}

      <SignatureModal
        isSignatureModalOpen={isSignatureModalOpen}
        setIsSignatureModalOpen={setIsSignatureModalOpen}
      />
    </div>
  );
}
