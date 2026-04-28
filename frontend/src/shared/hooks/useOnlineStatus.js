import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    let timer;

    const goOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      timer = setTimeout(() => setShowBackOnline(false), 3000);
    };

    const goOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
      clearTimeout(timer);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      clearTimeout(timer);
    };
  }, []);

  return { isOnline, showBackOnline };
}
