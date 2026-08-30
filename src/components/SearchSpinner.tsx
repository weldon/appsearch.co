export function SearchSpinner() {
  return (
    <div
      className="flex flex-col items-center gap-3 py-8"
      role="status"
      aria-live="polite"
      aria-label="Loading search results"
    >
      <div className="search-spinner" />
      <p className="text-sm text-gray-600">Searching the App Store…</p>
    </div>
  );
}
