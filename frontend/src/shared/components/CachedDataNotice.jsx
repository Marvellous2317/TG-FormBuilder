export default function CachedDataNotice({ cachedAt }) {
  if (!cachedAt) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
      <p className="text-xs font-geist">
        Showing data cached on {new Date(cachedAt).toLocaleString()} — some
        details may be outdated until you reconnect.
      </p>
    </div>
  );
}
