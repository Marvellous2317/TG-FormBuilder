import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineBanner() {
  const { isOnline, showBackOnline } = useOnlineStatus();

  if (isOnline && !showBackOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:bottom-6 md:left-6 md:right-auto md:w-80 pointer-events-none">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-colors duration-300 ${
          isOnline ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'
        }`}
      >
        {isOnline ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" fill="currentColor" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" fill="currentColor" />
          </svg>
        )}

        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {isOnline ? 'Back online' : 'You are offline'}
          </p>
          <p className="text-xs opacity-80 mt-0.5 leading-tight">
            {isOnline
              ? 'Your connection has been restored'
              : 'Changes will sync when reconnected'}
          </p>
        </div>
      </div>
    </div>
  );
}
