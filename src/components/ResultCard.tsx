import { PlatformBadge } from "./PlatformBadge";
import type { AppSearchResult } from "../types/appSearchResult";

type ResultCardProps = {
  result: AppSearchResult;
  showPlatformBadge: boolean;
};

export function ResultCard({ result, showPlatformBadge }: ResultCardProps) {
  return (
    <article className="grid grid-cols-[128px_1fr] gap-4 rounded-lg border border-gray-200 p-4 text-left">
      <div className="icon-wrapper icon-wrapper--128 icon-wrapper--post-ios7">
        <img
          src={result.artworkUrl512}
          alt={`${result.trackName} icon`}
          className="icon icon--128 icon--post-ios7 h-32 w-32"
          width={128}
          height={128}
        />
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {result.trackName}
          </h2>
          {showPlatformBadge ? <PlatformBadge label={result.platformLabel} /> : null}
        </div>
        <p className="font-mono text-sm text-gray-600">{result.bundleId}</p>
        <a
          href={result.trackViewUrl}
          className="app-store-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${result.trackName} on the App Store`}
        >
          View on the App Store
        </a>
      </div>
    </article>
  );
}
