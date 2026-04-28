import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './core/router';
import ToastProvider from './shared/components/ToastProvider';
import { InstallButton } from './shared/components/InstallButton';
import { OfflineBanner } from './shared/components/OfflineBanner';
import { syncPendingSubmissions } from './lib/syncQueue';
import { useEffect } from 'react';
import { useOnlineStatus } from './shared/hooks/useOnlineStatus';

const queryClient = new QueryClient();

const App = () => {
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      syncPendingSubmissions();
    }
  }, [isOnline]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} fallbackElement={<div>Loading...</div>} />
      <ToastProvider />
      <InstallButton />
      <OfflineBanner />
    </QueryClientProvider>
  );
};

export default App;
