import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Aggressive cleanup for development: unregister all service workers and clear caches
const cleanupServiceWorkers = async () => {
  if (import.meta.env.DEV) {
    console.log('[DEV] Cleaning up service workers and caches...');

    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`[DEV] Found ${registrations.length} service worker(s)`);
        for (const registration of registrations) {
          const unregistered = await registration.unregister();
          console.log(
            `[DEV] Unregistered service worker: ${unregistered ? 'success' : 'failed'}`,
          );
        }
      } catch (err) {
        console.warn('[DEV] Error unregistering service workers:', err);
      }
    }

    // Clear all caches
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        console.log(
          `[DEV] Found ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`,
        );
        for (const cacheName of cacheNames) {
          const deleted = await caches.delete(cacheName);
          console.log(
            `[DEV] Deleted cache '${cacheName}': ${deleted ? 'success' : 'failed'}`,
          );
        }
      } catch (err) {
        console.warn('[DEV] Error clearing caches:', err);
      }
    }

    console.log('[DEV] Cleanup complete');
  }
};

// Run cleanup immediately
cleanupServiceWorkers();

// Also run cleanup periodically in dev to handle hot module replacement
if (import.meta.env.DEV) {
  // Check every 5 seconds for any new service workers
  setInterval(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length > 0) {
          console.log(
            '[DEV] Found service worker(s) during polling, cleaning up...',
          );
          cleanupServiceWorkers();
        }
      });
    }
  }, 5000);
}
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
