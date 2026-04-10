import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  IoCheckmarkCircle,
  IoClose,
  IoInformationCircle,
} from 'react-icons/io5';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { MdError } from 'react-icons/md';
import Button from './Button';
import { useToastStore } from '../store/toastStore';

const toastStyles = {
  success: {
    icon: IoCheckmarkCircle,
    iconColor: 'text-secondary-900',
    accent: 'border-l-4 border-secondary-900',
    iconBg: 'bg-secondary-800',
  },
  error: {
    icon: MdError,
    iconColor: 'text-tertiary-500',
    accent: 'border-l-4 border-tertiary-500',
    iconBg: 'bg-tertiary-600',
  },
  info: {
    icon: IoInformationCircle,
    iconColor: 'text-primary-200',
    accent: 'border-l-4 border-primary-200',
    iconBg: 'bg-blue-50',
  },
  warning: {
    icon: HiExclamationTriangle,
    iconColor: 'text-amber-600',
    accent: 'border-l-4 border-amber-500',
    iconBg: 'bg-amber-50',
  },
};

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);

    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.duration, toast.id]);

  const currentStyle = toastStyles[toast.type] || toastStyles.info;
  const Icon = currentStyle.icon;

  return (
    <div
      className={`pointer-events-auto w-full rounded-2xl bg-white shadow-lg shadow-black/10 ring-1 ring-black/5 ${currentStyle.accent}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${currentStyle.iconBg}`}
        >
          <Icon className={currentStyle.iconColor} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-geist text-sm font-semibold text-secondary-300">
            {toast.title}
          </p>
          {toast.message ? (
            <p className="mt-1 font-geist text-sm text-tertiary">
              {toast.message}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-full p-1.5 text-tertiary hover:bg-gray-100"
          aria-label="Dismiss notification"
        >
          <IoClose size={18} />
        </Button>
      </div>
    </div>
  );
}

export default function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-100 flex justify-end p-4 sm:p-6">
      <div className="flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>,
    document.body,
  );
}
