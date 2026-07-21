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

const APP_VERSION_KEY = 'digiforms_frontend_version';

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
        return failureCount < 1;
      },
    },
  },
});

const checkForNewVersion = async () => {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      header: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok) return;

    const { version } = await res.json();

    if (!version) return;

    const currentVersion = localStorage.getItem(APP_VERSION_KEY);

    if (!currentVersion) {
      localStorage.setItem(APP_VERSION_KEY, version);
      return;
    }

    if (currentVersion !== version) {
      const answer = confirm(
        'There is an update available. Will you like to refresh to see new features? If no will ask again in 5 minutes',
      );
      if (answer) {
        localStorage.setItem(APP_VERSION_KEY, version);
        window.location.reload();
        console.log('Frontend refreshed.');
      } else {
        console.log('Will ask for refresh in 5 mins.');
      }
    }
  } catch {
    // ignore version check failure
  }
};

const App = () => {
  useEffect(() => {
    const handleOnline = () => syncPendingSubmissions();
    window.addEventListener('online', handleOnline);

    // Also flush any pending submissions on app load — the 'online' event
    // only fires on a live offline->online transition, so a queue left over
    // from a previous session (app reopened when already back online) would
    // otherwise never get synced.
    if (navigator.onLine) syncPendingSubmissions();

    // The browser 'online' event is unreliable in practice — e.g. Wi-Fi stays
    // connected while the actual internet route drops and comes back, which
    // never toggles the network interface and so never fires 'online'. Poll
    // as a fallback so the queue doesn't get stuck until the app is reloaded.
    const intervalId = window.setInterval(() => {
      if (navigator.onLine) syncPendingSubmissions();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    checkForNewVersion();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForNewVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intervalId = window.setInterval(checkForNewVersion, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(intervalId);
    };
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
