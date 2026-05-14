const clearAllCaches = async () => {
  if ('caches' in window) {
    // To delete just the sensitive API cache:
    await caches.delete('api-cache');
    await caches.delete('assets-cache');

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }

  localStorage.clear();
  sessionStorage.clear();
};

export default clearAllCaches;
