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
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    iconBg:
      'bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 text-white shadow-lg shadow-emerald-500/25',
    progress: 'bg-emerald-500',
  },
  error: {
    icon: MdError,
    iconColor: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    iconBg:
      'bg-gradient-to-br from-rose-500 via-rose-400 to-orange-400 text-white shadow-lg shadow-rose-500/25',
    progress: 'bg-rose-500',
  },
  info: {
    icon: IoInformationCircle,
    iconColor: 'text-sky-600',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    iconBg:
      'bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 text-white shadow-lg shadow-sky-500/25',
    progress: 'bg-sky-500',
  },
  warning: {
    icon: HiExclamationTriangle,
    iconColor: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    iconBg:
      'bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 text-white shadow-lg shadow-amber-500/25',
    progress: 'bg-amber-500',
  },
};

const toastLabels = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
  warning: 'Warning',
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
  const label = toastLabels[toast.type] || toastLabels.info;

  return (
    <div
      className="pointer-events-auto relative w-full overflow-hidden rounded-[24px] border border-white/70 bg-white/95 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl ring-1 ring-slate-200/70"
      role="status"
      aria-live="polite"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 origin-left animate-[toast-shrink_linear_forwards] ${currentStyle.progress}`}
        style={{ animationDuration: `${toast.duration}ms` }}
      />
      <div className="flex items-start gap-4 p-4">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${currentStyle.iconBg}`}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ring-1 ${currentStyle.badge}`}
            >
              {label}
            </span>
          </div>
          <p className="mt-2 font-geist text-sm font-medium leading-6 text-slate-700">
            {toast.message}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
      <style>
        {`
          @keyframes toast-shrink {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}
      </style>
    </div>,
    document.body,
  );
}
