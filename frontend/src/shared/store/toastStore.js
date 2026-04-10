import { create } from 'zustand';

const DEFAULT_DURATION = 4000;

const buildToast = ({
  title,
  message = '',
  type = 'info',
  duration = DEFAULT_DURATION,
}) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  title,
  message,
  type,
  duration,
});

export const useToastStore = create((set) => ({
  toasts: [],
  showToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, buildToast(toast)],
    })),
  showSuccess: (title, message = '', duration = DEFAULT_DURATION) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        buildToast({ title, message, type: 'success', duration }),
      ],
    })),
  showError: (title, message = '', duration = DEFAULT_DURATION) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        buildToast({ title, message, type: 'error', duration }),
      ],
    })),
  showInfo: (title, message = '', duration = DEFAULT_DURATION) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        buildToast({ title, message, type: 'info', duration }),
      ],
    })),
  showWarning: (title, message = '', duration = DEFAULT_DURATION) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        buildToast({ title, message, type: 'warning', duration }),
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));
