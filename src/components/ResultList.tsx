import { ResultCard } from "./ResultCard";
import type { AppSearchResult } from "../types/appSearchResult";

type ResultListProps = {
  results: AppSearchResult[];
  showPlatformBadge: boolean;
};

export function ResultList({ results, showPlatformBadge }: ResultListProps) {
  return (
    <div className="grid gap-4">
      {results.map((result) => (
        <ResultCard
          key={result.trackId}
          result={result}
          showPlatformBadge={showPlatformBadge}
        />
      ))}
    </div>
  );
}
