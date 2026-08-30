import type { PlatformLabel } from "../types/appSearchResult";

type PlatformBadgeProps = {
  label: PlatformLabel;
};

export function PlatformBadge({ label }: PlatformBadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
      {label}
    </span>
  );
}
