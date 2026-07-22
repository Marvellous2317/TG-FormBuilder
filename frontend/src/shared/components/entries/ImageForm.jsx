// shared/components/entries/ImageForm.jsx
import React, { useEffect, useState } from 'react';
import InputField from '../InputField';
import { FiUpload, FiCamera, FiX, FiZoomIn, FiDownload } from 'react-icons/fi';
import CameraModal from '../CameraModal';

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

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
  if (file.size > MAX_SIZE_BYTES) return 'Image size should be less than 2MB';
  return null;
}

// Inline lightbox — kept in this file so ImageForm is fully self-contained.
function ImageViewerModal({ src, alt = 'Image', onClose }) {
  if (!src) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-12 right-0 flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition-colors cursor-pointer"
            title="Download image"
          >
            <FiDownload size={18} className="text-secondary-400" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition-colors cursor-pointer"
            title="Close"
          >
            <FiX size={18} className="text-red-500" />
          </button>
        </div>
        <img
          src={src}
          alt={alt}
          className="w-full h-full max-h-[90vh] object-contain rounded-2xl"
        />
      </div>
    </div>
  );
}

export default function ImageForm({
  entry,
  formData,
  setFormData,
  readOnly = false,
}) {
  const entryId = entry?.entryId;
  const [error, setError] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [useFallbackSrc, setUseFallbackSrc] = useState(false);

  const storedSrc =
    formData[entryId]?.value ?? entry?.value ?? entry?.imageUrl ?? null;
  const base64Src = entry?.image ?? null;

  const imagePreview = useFallbackSrc
    ? (base64Src ?? storedSrc)
    : (storedSrc ?? base64Src);

  const handleImageError = () => {
    if (!useFallbackSrc && base64Src && storedSrc && storedSrc !== base64Src) {
      setUseFallbackSrc(true);
    }
  };

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
      setUseFallbackSrc(false);
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

  const handleCameraCapture = () => {
    if (readOnly) return;
    setShowCameraModal(true);
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
            <span className="ml-1 text-red-600 text-xs" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {entry?.config?.instructions && (
        <p className="mb-2 text-sm text-secondary-400">
          {entry.config.instructions}
        </p>
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
        <div className="group relative inline-block">
          <img
            src={imagePreview}
            alt={entry?.name || 'Uploaded image'}
            onError={handleImageError}
            onClick={() => setShowViewer(true)}
            className="max-h-64 cursor-zoom-in rounded-2xl border border-secondary-200 object-contain transition-opacity hover:opacity-90"
          />

          {/* Always-visible view affordance, even in readOnly mode */}
          <button
            type="button"
            onClick={() => setShowViewer(true)}
            className="absolute bottom-2 left-2 rounded-full bg-white/90 p-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white cursor-pointer"
            title="View full size"
          >
            <FiZoomIn size={16} className="text-secondary-400" />
          </button>

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
          <p className="text-sm font-geist text-secondary-400">
            No image uploaded
          </p>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="rounded-2xl border-secondary-200 p-8 transition-colors"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => document.getElementById(fileInputId).click()}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-secondary-200 bg-white px-4 py-6 hover:bg-primary-200/5 transition-colors cursor-pointer"
            >
              <FiUpload size={20} className="text-secondary-400" />
              <span className="font-geist text-sm text-secondary">
                Upload Image
              </span>
            </button>
            <button
              type="button"
              onClick={handleCameraCapture}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-secondary-200 bg-white px-4 py-6 hover:bg-primary-200/5 transition-colors cursor-pointer"
            >
              <FiCamera size={20} className="text-secondary-400" />
              <span className="font-geist text-sm text-secondary">
                Take Photo
              </span>
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500 font-geist">{error}</p>}

      {showCameraModal && (
        <CameraModal
          facingMode="environment"
          onCapture={(file) => processFile(file)}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {showViewer && (
        <ImageViewerModal
          src={imagePreview}
          alt={entry?.name}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  );
}
