export type PlatformKey = "iphone" | "ipad" | "mac";

export type PlatformLabel = "iPhone" | "iPad" | "Mac" | "App";

export type AppSearchResult = {
  trackId: number;
  trackName: string;
  bundleId: string;
  artworkUrl512: string;
  trackViewUrl: string;
  platformLabel: PlatformLabel;
};

export type SearchStatus = "idle" | "loading" | "success" | "empty" | "error";

export type iTunesSearchResult = {
  trackId: number;
  trackName: string;
  bundleId: string;
  artworkUrl512: string;
  trackViewUrl: string;
  kind?: string;
  wrapperType?: string;
  features?: string[];
  supportedDevices?: string[];
};

export type iTunesSearchResponse = {
  resultCount: number;
  results: iTunesSearchResult[];
};
