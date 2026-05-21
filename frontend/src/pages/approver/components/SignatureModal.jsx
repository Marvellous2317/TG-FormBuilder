import { useRef, useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import Icons from '../../../assets/icons';
import { useApproverSignature } from '../../../shared/hooks/approver/useApprover';
import Loader from '../../../shared/components/Loader';
import useToast from '../../../shared/hooks/useToast';
import { useAuthStore } from '../../../shared/store/authStore';

export default function SignatureModal({
  isSignatureModalOpen,
  setIsSignatureModalOpen,
}) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const { mutateAsync: saveSignature, isPending: isSavingSignature } =
    useApproverSignature();

  const { showError, showSuccess } = useToast();

  const { setUser, user } = useAuthStore();

  // Initialize canvas context and set up drawing
  useEffect(() => {
    if (!isSignatureModalOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
  }, [isSignatureModalOpen]);

  const trimCanvasToDataURL = (canvas) => {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;

    let minX = width,
      minY = height,
      maxX = 0,
      maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (pixels[(y * width + x) * 4 + 3] > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (minX > maxX || minY > maxY) return null;

    const pad = 10;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);

    const trimmed = document.createElement('canvas');
    trimmed.width = maxX - minX + 1;
    trimmed.height = maxY - minY + 1;
    trimmed
      .getContext('2d')
      .drawImage(
        canvas,
        minX,
        minY,
        trimmed.width,
        trimmed.height,
        0,
        0,
        trimmed.width,
        trimmed.height,
      );
    return trimmed.toDataURL('image/png');
  };

  const compressImage = (dataUrl) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 500;
        const maxH = 250;
        let { width: w, height: h } = img;
        if (w > maxW) {
          h = (h * maxW) / w;
          w = maxW;
        }
        if (h > maxH) {
          w = (w * maxH) / h;
          h = maxH;
        }
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.75));
      };
      img.src = dataUrl;
    });

  // Drawing logic
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasCoordinates(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCanvasCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // canvas physical width divided by CSS width
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if (e.touches) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  };

  const handleSignatureUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageDataUrl(reader.result);
      setHasSignature(true);
    };
    reader.readAsDataURL(file);
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearCanvas = () => {
    setUploadedImageDataUrl(null);
    setHasSignature(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const confirmSignature = async () => {
    let signatureDataURL;

    if (uploadedImageDataUrl) {
      signatureDataURL = await compressImage(uploadedImageDataUrl);
    } else {
      signatureDataURL = canvasRef.current
        ? trimCanvasToDataURL(canvasRef.current)
        : null;
    }

    if (!signatureDataURL) {
      showError('Please add a signature before saving.');
      return;
    }

    try {
      await saveSignature({ signature: signatureDataURL });
      showSuccess('Signature saved successfully');
      setUser({ ...user, signature: signatureDataURL });
    } catch (error) {
      console.error('Error saving signature', error);
      showError('Unable to save signature. Please try again.');
      return;
    }

    setIsSignatureModalOpen(false);
  };

  if (!isSignatureModalOpen) return null;

  return (
    <Modal
      isOpen={isSignatureModalOpen}
      onClose={() => {
        clearCanvas();
        setIsSignatureModalOpen(false);
      }}
      position="center"
      width="max-w-[612px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <h2 className="text-base font-semibold font-geist text-primary">
          Sign document
        </h2>
        <p className="text-sm mt-1 font-geist text-tertiary">
          Your signature will be added to approved logs
        </p>

        {/* Canvas drawing area */}
        <div className="mt-4 rounded-md bg-secondary-700 px-4 py-3.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSignatureUpload}
          />

          {uploadedImageDataUrl ? (
            <div className="w-full h-50 overflow-hidden rounded-md bg-secondary-700">
              <img
                src={uploadedImageDataUrl}
                alt="Uploaded signature preview"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-50 touch-none cursor-crosshair bg-secondary-700"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          )}

          <div className="mt-3 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={clearCanvas}
              className="text-sm font-medium flex items-center gap-2 transition text-secondary"
            >
              <img
                src={Icons.eraserIcon}
                alt="clear canvas"
                className="w-4 object-contain"
              />
              Clear
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-4 gap-3">
          <Button
            className="flex items-center gap-2 px-4 py-2.5"
            onClick={openFilePicker}
            type="button"
          >
            <img
              src={Icons.penIcon}
              alt="upload signature"
              className="w-3 object-contain"
            />
            <p className="text-sm font-medium text-primary-200">
              Upload a signature
            </p>
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                clearCanvas();
                setIsSignatureModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-secondary bg-tertiary-200 rounded-[10px] transition"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmSignature}
              disabled={!hasSignature}
              className="px-3 py-2 text-sm font-medium text-white bg-primary-200 rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition flex gap-2"
            >
              Save Signature
              {isSavingSignature && <Loader size="border-white! h-4.5 w-4.5" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
