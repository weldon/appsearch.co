import { useCallback, useRef, useState } from "react";
import { PlatformSelector } from "../components/PlatformSelector";
import { ResultList } from "../components/ResultList";
import { SearchForm } from "../components/SearchForm";
import { SearchSpinner } from "../components/SearchSpinner";
import { searchApps } from "../services/appStoreSearch";
import type {
  AppSearchResult,
  PlatformKey,
  SearchStatus,
} from "../types/appSearchResult";

export function HomePage() {
  const [term, setTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey | null>(
    null,
  );
  const [results, setResults] = useState<AppSearchResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [lastQuery, setLastQuery] = useState("");
  const [platformWarning, setPlatformWarning] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const runSearch = useCallback(async (searchTerm: string, platform: PlatformKey) => {
    const trimmed = searchTerm.trim();
    const currentRequestId = ++requestIdRef.current;

    setStatus("loading");
    setLastQuery(trimmed);
    setPlatformWarning(null);

    try {
      const nextResults = await searchApps(trimmed, platform);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setResults(nextResults);
      setStatus(nextResults.length > 0 ? "success" : "empty");
    } catch {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setResults([]);
      setStatus("error");
    }
  }, []);

  const handleSearchSubmit = () => {
    const trimmed = term.trim();

    if (!trimmed) {
      setPlatformWarning("Enter a search term before selecting a platform.");
      return;
    }

    if (!selectedPlatform) {
      setPlatformWarning("Select a platform to run your search.");
      return;
    }

    void runSearch(trimmed, selectedPlatform);
  };

  const handlePlatformSelect = (platform: PlatformKey) => {
    const trimmed = term.trim();

    if (!trimmed) {
      setPlatformWarning("Enter a search term before selecting a platform.");
      return;
    }

    setSelectedPlatform(platform);
    void runSearch(trimmed, platform);
  };

  const handleTermChange = (value: string) => {
    setTerm(value);

    if (value.trim()) {
      setPlatformWarning(null);
    }
  };

  const isLoading = status === "loading";

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8">
      <section className="space-y-4">
        <SearchForm
          value={term}
          onChange={handleTermChange}
          onSubmit={handleSearchSubmit}
        />
        <PlatformSelector
          value={selectedPlatform}
          onSelect={handlePlatformSelect}
        />
        {platformWarning ? (
          <p className="text-left text-sm text-amber-700" role="alert">
            {platformWarning}
          </p>
        ) : null}
      </section>

      <section
        aria-busy={isLoading}
        aria-live="polite"
        className="min-h-[120px] space-y-4"
      >
        {isLoading ? <SearchSpinner /> : null}

        {!isLoading && status === "success" ? (
          <>
            <p className="text-left text-sm font-medium text-gray-700">
              {results.length} results
            </p>
            <ResultList results={results} showPlatformBadge={false} />
          </>
        ) : null}

        {!isLoading && status === "empty" ? (
          <p className="text-left text-gray-600">
            No apps found for &ldquo;{lastQuery}&rdquo;.
          </p>
        ) : null}

        {!isLoading && status === "error" ? (
          <div className="space-y-3 text-left">
            <p className="text-red-600">
              Something went wrong while searching. Please try again.
            </p>
            {selectedPlatform ? (
              <button
                type="button"
                onClick={() => runSearch(term, selectedPlatform)}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <footer className="border-t border-gray-200 pt-16 pb-8">
        <h1 className="text-3xl font-semibold text-gray-900">AppSearch</h1>
        <p className="mt-2 text-gray-500">Brought to you by Rewind Technology</p>
      </footer>
    </main>
  );
}
