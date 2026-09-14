import Button from './Button';
import { MdCancel } from 'react-icons/md';
import { useEffect, useState } from 'react';

const APP_VERSION_KEY = 'taca_app_version';

const checkForNewVersion = async () => {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      header: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok) return null;

    const { version } = await res.json();

    if (!version) return null;

    const currentVersion = localStorage.getItem(APP_VERSION_KEY);

    if (!currentVersion) {
      localStorage.setItem(APP_VERSION_KEY, version);
      return null;
    }

    if (currentVersion !== version) {
      return version;
    }

    return null;
  } catch {
    return null;
  }
};

export default function RefreshAppPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [newVersion, setNewVersion] = useState(null);

  useEffect(() => {
    const handleCheckVersion = async () => {
      const version = await checkForNewVersion();
      if (version) {
        setNewVersion(version);
        setShowPrompt(true);
      }
    };

    handleCheckVersion();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleCheckVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const intervalId = window.setInterval(handleCheckVersion, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);

  const handleUpdate = () => {
    localStorage.setItem(APP_VERSION_KEY, newVersion);
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-secondary-700 flex items-center gap-3 p-4 shadow-2xl rounded-2xl border border-secondary-200 hover:border-secondary-300 transition-colors">
        <p className="text-sm text-tertiary font-geist">
          Update your app to get the latest features.
        </p>
        <Button
          className="rounded-lg bg-primary-200 text-white hover:bg-primary-100 text-xs font-medium font-geist px-3 py-1.5 transition-colors whitespace-nowrap"
          onClick={handleUpdate}
        >
          Update
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1 text-tertiary hover:text-primary-200 transition-colors"
          aria-label="Dismiss update prompt"
        >
          <MdCancel size={16} />
        </button>
      </div>
    </div>
  );
}
