import { create } from 'zustand';

const DEFAULT_DURATION = 4000;

const buildToast = ({
  message,
  type = 'info',
  duration = DEFAULT_DURATION,
}) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  message,
  type,
  duration,
});

export const useToastStore = create((set) => ({
  toasts: [],
  showToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        buildToast(
          typeof toast === 'string'
            ? { message: toast }
            : { ...toast, message: toast.message || '' },
        ),
      ],
    })),
  showSuccess: (message, duration = DEFAULT_DURATION) =>
    set((state) => ({
      toasts: [...state.toasts, buildToast({ message, type: 'success', duration })],
    })),
  showError: (message, duration = DEFAULT_DURATION) =>
    set((state) => ({
      toasts: [...state.toasts, buildToast({ message, type: 'error', duration })],
    })),
  showInfo: (message, duration = DEFAULT_DURATION) =>
    set((state) => ({
      toasts: [...state.toasts, buildToast({ message, type: 'info', duration })],
    })),
  showWarning: (message, duration = DEFAULT_DURATION) =>
    set((state) => ({
      toasts: [...state.toasts, buildToast({ message, type: 'warning', duration })],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));
