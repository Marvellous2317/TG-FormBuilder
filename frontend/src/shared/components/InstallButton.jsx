import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function InstallButton() {
  const { isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-6 md:right-6 md:left-auto md:w-80">
      <div className="relative bg-white border border-gray-200 shadow-2xl rounded-t-2xl md:rounded-2xl p-4 md:p-5">
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-3 pr-6">
          <img
            src="/icons/manifest-icon-192.maskable.png"
            alt="App icon"
            className="w-12 h-12 rounded-xl shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">Packaging Checklist</p>
            <p className="text-xs text-gray-500 mt-0.5">Install for quick offline access</p>
          </div>
        </div>

        <button
          onClick={install}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-150 text-white text-sm font-medium py-2.5 rounded-xl cursor-pointer"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
