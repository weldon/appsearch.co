import { useState } from "react";
import { PlatformBadge } from "./PlatformBadge";
import type { AppSearchResult } from "../types/appSearchResult";
import { copyToClipboard } from "../utils/copyToClipboard";

type ResultCardProps = {
  result: AppSearchResult;
  showPlatformBadge: boolean;
};

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <rect height="13" rx="2" ry="2" width="13" x="9" y="9" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CopiedIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-green-600"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ResultCard({ result, showPlatformBadge }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(result.bundleId);

    if (!success) {
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

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
        <button
          type="button"
          onClick={handleCopy}
          aria-label={
            copied
              ? `Copied bundle ID ${result.bundleId}`
              : `Copy bundle ID ${result.bundleId}`
          }
          className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 font-mono text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <span>{result.bundleId}</span>
          {copied ? <CopiedIcon /> : <CopyIcon />}
        </button>
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
