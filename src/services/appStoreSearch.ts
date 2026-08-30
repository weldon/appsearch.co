import fetchJsonp from "fetch-jsonp";
import type {
  AppSearchResult,
  iTunesSearchResponse,
  iTunesSearchResult,
  PlatformKey,
  PlatformLabel,
} from "../types/appSearchResult";

export const ENTITY_BY_PLATFORM: Record<
  PlatformKey,
  { entity: string; platformLabel: PlatformLabel }
> = {
  iphone: { entity: "software", platformLabel: "iPhone" },
  ipad: { entity: "iPadSoftware", platformLabel: "iPad" },
  mac: { entity: "macSoftware", platformLabel: "Mac" },
};

export function buildSearchUrl(term: string, platform: PlatformKey): string {
  const { entity } = ENTITY_BY_PLATFORM[platform];
  const params = new URLSearchParams({
    term: term.trim(),
    limit: "50",
  });

  return `https://itunes.apple.com/search?${params.toString()}&entity=${entity}`;
}

export function inferPlatformLabel(result: iTunesSearchResult): PlatformLabel {
  const kind = result.kind?.toLowerCase() ?? "";
  const wrapperType = result.wrapperType?.toLowerCase() ?? "";

  if (kind.includes("mac") || wrapperType.includes("mac")) {
    return "Mac";
  }

  const devices = result.supportedDevices ?? [];
  const hasIPad = devices.some((device) => /iPad/i.test(device));
  const hasIPhone = devices.some((device) => /iPhone|iPod/i.test(device));

  if (hasIPad && !hasIPhone) {
    return "iPad";
  }

  if (hasIPhone) {
    return "iPhone";
  }

  if (result.features?.includes("iosUniversal")) {
    return "iPhone";
  }

  return "App";
}

export function mapSearchResult(
  result: iTunesSearchResult,
  sourcePlatformLabel?: PlatformLabel,
): AppSearchResult {
  let platformLabel = inferPlatformLabel(result);

  if (sourcePlatformLabel === "Mac" || sourcePlatformLabel === "iPad") {
    platformLabel = sourcePlatformLabel;
  }

  return {
    trackId: result.trackId,
    trackName: result.trackName,
    bundleId: result.bundleId,
    artworkUrl512: result.artworkUrl512,
    trackViewUrl: result.trackViewUrl,
    platformLabel,
  };
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeSearchResults(
  results: iTunesSearchResult[],
  sourcePlatformLabel?: PlatformLabel,
): AppSearchResult[] {
  return results
    .filter(
      (result) =>
        result.trackId &&
        result.trackName &&
        result.bundleId &&
        result.artworkUrl512 &&
        isValidHttpUrl(result.trackViewUrl),
    )
    .map((result) => mapSearchResult(result, sourcePlatformLabel));
}

export async function searchApps(
  term: string,
  platform: PlatformKey,
): Promise<AppSearchResult[]> {
  const trimmed = term.trim();

  if (!trimmed) {
    return [];
  }

  const { platformLabel } = ENTITY_BY_PLATFORM[platform];
  const url = buildSearchUrl(trimmed, platform);
  const response = await fetchJsonp(url, { timeout: 15000 });
  const data = (await response.json()) as iTunesSearchResponse;

  return sanitizeSearchResults(data.results ?? [], platformLabel);
}
