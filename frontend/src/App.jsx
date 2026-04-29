import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './core/router';
import ToastProvider from './shared/components/ToastProvider';
import { InstallButton } from './shared/components/InstallButton';
import { OfflineBanner } from './shared/components/OfflineBanner';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { syncPendingSubmissions } from './lib/syncQueue';
import { useEffect } from 'react';

const queryClient = new QueryClient({
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
