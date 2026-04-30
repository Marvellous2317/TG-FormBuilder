import './App.css';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { useAuthStore } from './shared/store/authStore';
import { useToastStore } from './shared/store/toastStore';
import { RouterProvider } from 'react-router-dom';
import { router } from './core/router';
import ToastProvider from './shared/components/ToastProvider';
import { InstallButton } from './shared/components/InstallButton';
import { OfflineBanner } from './shared/components/OfflineBanner';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { syncPendingSubmissions } from './lib/syncQueue';
import { useEffect } from 'react';

const handleAuthError = (error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403) {
    useAuthStore.getState().clearAuth();
    useToastStore
      .getState()
      .showError(
        status === 401 ? 'Session expired. Please log in.' : 'Access denied.',
      );
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthError }),
  mutationCache: new MutationCache({ onError: handleAuthError }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

const App = () => {
  useEffect(() => {
    const handleOnline = () => syncPendingSubmissions();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider
          router={router}
          fallbackElement={<div>Loading...</div>}
        />
        <ToastProvider />
        <InstallButton />
        <OfflineBanner />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
