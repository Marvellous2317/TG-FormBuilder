// shared/components/entries/ImageForm.jsx
import React, { useEffect, useState } from 'react';
import InputField from '../InputField';
import { FiUpload, FiCamera, FiX } from 'react-icons/fi';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validateImageFile(file) {
  if (!file.type.startsWith('image/')) return 'Please select an image file';
  if (file.size > MAX_SIZE_BYTES) return 'Image size should be less than 5MB';
  return null;
}

export default function ImageForm({ entry, formData, setFormData, readOnly = false }) {
  const entryId = entry?.entryId;
  const [error, setError] = useState(null);

  const imagePreview = formData[entryId]?.value ?? entry?.value ?? null;

  // Seed formData from an existing entry.value, same guard pattern as BasicForm
  useEffect(() => {
    if (!entryId) return;
    if (formData[entryId] !== undefined) return;
    if (!entry?.value) return;
    setFormData((prev) => ({
      ...prev,
      [entryId]: { entryId, value: entry.value },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId, entry?.value]);

  const processFile = async (file) => {
    if (!file || readOnly) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    try {
      const base64String = await readFileAsBase64(file);
      if (!entryId) return;
      setFormData((prev) => ({
        ...prev,
        [entryId]: { entryId, value: base64String },
      }));
    } catch {
      setError('Could not read that file — please try again');
    }
  };

  const handleFileChange = (event) => {
    processFile(event.target.files?.[0]);
    event.target.value = ''; // allow re-selecting the same file
  };

  // Camera capture uses a separate, temporary input (capture="environment"
  // only makes sense on its own input — mixing it into the gallery picker
  // above would force camera on every "Upload Image" tap on mobile).
  const handleCameraCapture = () => {
    if (readOnly) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => processFile(e.target.files?.[0]);
    input.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (readOnly) return;
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event) => event.preventDefault();

  const handleRemoveImage = () => {
    if (readOnly || !entryId) return;
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [entryId]: { entryId, value: null },
    }));
  };

  const fileInputId = `image-upload-${entryId}`;

  return (
    <div className="mt-5 w-full">
      {entry?.name && (
        <label className="mb-2 block font-geist text-sm font-regular text-secondary">
          {entry.name}
          {entry?.required && (
            <span className="ml-1 text-red-600 text-xs" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {entry?.config?.instructions && (
        <p className="mb-2 text-sm text-secondary-400">{entry.config.instructions}</p>
      )}

      {/* Hidden real input, rendered through the shared InputField */}
      <InputField
        id={fileInputId}
        name={fileInputId}
        type="file"
        value=""
        accept="image/*"
        onChange={handleFileChange}
        required={entry?.required}
        disabled={readOnly}
        className="hidden"
      />

      {imagePreview ? (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt={entry?.name}
            className="max-h-64 rounded-2xl border border-secondary-200 object-contain"
          />
          {!readOnly && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => document.getElementById(fileInputId).click()}
                className="rounded-full bg-white p-2 shadow-md hover:bg-secondary-50 transition-colors cursor-pointer"
                title="Replace image"
              >
                <FiUpload size={16} className="text-secondary-400" />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="rounded-full bg-white p-2 shadow-md hover:bg-secondary-50 transition-colors cursor-pointer"
                title="Remove image"
              >
                <FiX size={16} className="text-red-500" />
              </button>
            </div>
          )}
        </div>
      ) : readOnly ? (
        <div className="rounded-2xl border-2 border-dashed border-secondary-200 p-8 text-center">
          <p className="text-sm font-geist text-secondary-400">No image uploaded</p>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="rounded-2xl border-2 border-dashed border-secondary-200 p-8 hover:border-primary-200/75 transition-colors"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => document.getElementById(fileInputId).click()}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-secondary-200 bg-white px-4 py-6 hover:bg-primary-200/5 transition-colors cursor-pointer"
            >
              <FiUpload size={20} className="text-secondary-400" />
              <span className="font-geist text-sm text-secondary">Upload Image</span>
            </button>
            <button
              type="button"
              onClick={handleCameraCapture}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-secondary-200 bg-white px-4 py-6 hover:bg-primary-200/5 transition-colors cursor-pointer"
            >
              <FiCamera size={20} className="text-secondary-400" />
              <span className="font-geist text-sm text-secondary">Take Photo</span>
            </button>
          </div>
          <p className="mt-3 text-center font-geist text-xs text-secondary-400">
            or drag and drop an image here
          </p>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500 font-geist">{error}</p>}
    </div>
  );
}
