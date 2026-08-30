import type { PlatformKey } from "../types/appSearchResult";

export const PLATFORM_OPTIONS: { key: PlatformKey; label: string }[] = [
  { key: "iphone", label: "iPhone" },
  { key: "ipad", label: "iPad" },
  { key: "mac", label: "Mac" },
];

type PlatformSelectorProps = {
  value: PlatformKey | null;
  onSelect: (platform: PlatformKey) => void;
  disabled?: boolean;
};

export function PlatformSelector({
  value,
  onSelect,
  disabled = false,
}: PlatformSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Select a platform to run your search.
      </p>
      <div
        role="radiogroup"
        aria-label="Platforms"
        className="flex flex-wrap justify-center gap-2"
      >
        {PLATFORM_OPTIONS.map(({ key, label }) => {
          const selected = value === key;

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onSelect(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
