import React, { useEffect, useRef, useState } from 'react';

export default function CameraModal({
  onCapture,          // (file: File) => void
  onClose,            // () => void
  facingMode = 'environment',
  title = 'Take a Photo',
}) {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!capturedImage) startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error) {
      setCameraError(
        ''
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
  };

  const retakePhoto = () => setCapturedImage(null);

  const confirmPhoto = () => {
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onCapture(file);
        onClose();
      })
      .catch(() => setCameraError('Error saving image. Please try again.'));
  };

  const handleCancel = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-fredoka text-center mb-4">
          {capturedImage ? 'Review Photo' : title}
        </h2>

        {cameraError && (
          <p className="text-red-500 text-sm text-center mb-4">{cameraError}</p>
        )}

        <div className="flex justify-center mb-4">
          {!capturedImage ? (
            <div className="relative w-full max-h-80 bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto object-cover"
              />
              {!isCameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                  <span>Loading camera...</span>
                </div>
              )}
            </div>
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full max-h-80 object-contain rounded-lg"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!isCameraReady}
                className="px-6 py-2 rounded-full bg-primary-200 text-white font-poppins font-medium hover:bg-secondary-300 transition disabled:opacity-50"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-poppins font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={retakePhoto}
                className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-poppins font-medium hover:bg-gray-300 transition"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={confirmPhoto}
                className="px-6 py-2 rounded-full bg-primary-200 text-white font-poppins font-medium hover:bg-secondary-200 transition"
              >
                Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}