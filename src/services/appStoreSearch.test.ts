import { describe, expect, it } from "vitest";
import {
  buildSearchUrl,
  ENTITY_BY_PLATFORM,
  inferPlatformLabel,
  sanitizeSearchResults,
} from "../services/appStoreSearch";
import type { iTunesSearchResult } from "../types/appSearchResult";

describe("buildSearchUrl", () => {
  it("encodes spaces and punctuation in search terms", () => {
    const url = buildSearchUrl("hello world!", "mac");
    expect(url).toContain("term=hello+world%21");
    expect(url).toContain("entity=macSoftware");
  });

  it("builds a dedicated URL for each platform", () => {
    expect(buildSearchUrl("test", "iphone")).toContain("entity=software");
    expect(buildSearchUrl("test", "ipad")).toContain("entity=iPadSoftware");
    expect(buildSearchUrl("test", "mac")).toContain("entity=macSoftware");
    expect(Object.keys(ENTITY_BY_PLATFORM)).toEqual(["iphone", "ipad", "mac"]);
  });
});

describe("inferPlatformLabel", () => {
  it("identifies Mac apps from kind metadata", () => {
    const result: iTunesSearchResult = {
      trackId: 1,
      trackName: "Mac App",
      bundleId: "com.mac",
      artworkUrl512: "https://example.com/icon.png",
      trackViewUrl: "https://apps.apple.com/app/mac/id1",
      kind: "mac-software",
    };

    expect(inferPlatformLabel(result)).toBe("Mac");
  });

  it("identifies iPad-only apps from supported devices", () => {
    const result: iTunesSearchResult = {
      trackId: 2,
      trackName: "iPad App",
      bundleId: "com.ipad",
      artworkUrl512: "https://example.com/icon.png",
      trackViewUrl: "https://apps.apple.com/app/ipad/id2",
      supportedDevices: ["iPadPro", "iPadMini"],
    };

    expect(inferPlatformLabel(result)).toBe("iPad");
  });
});

describe("sanitizeSearchResults", () => {
  it("filters invalid URLs", () => {
    const raw: iTunesSearchResult[] = [
      {
        trackId: 10,
        trackName: "Valid",
        bundleId: "com.valid",
        artworkUrl512: "https://example.com/icon.png",
        trackViewUrl: "https://apps.apple.com/app/valid/id10",
      },
      {
        trackId: 11,
        trackName: "Invalid",
        bundleId: "com.invalid",
        artworkUrl512: "https://example.com/icon.png",
        trackViewUrl: "not-a-url",
      },
    ];

    const results = sanitizeSearchResults(raw, "Mac");
    expect(results).toHaveLength(1);
    expect(results[0]?.trackName).toBe("Valid");
  });

  it("labels Mac results from their source entity", () => {
    const macResult: iTunesSearchResult = {
      trackId: 462054704,
      trackName: "Microsoft Word",
      bundleId: "com.microsoft.Word",
      artworkUrl512: "https://example.com/word.png",
      trackViewUrl: "https://apps.apple.com/us/app/microsoft-word/id462054704",
      kind: "mac-software",
      wrapperType: "software",
    };

    expect(sanitizeSearchResults([macResult], "Mac")[0]?.platformLabel).toBe("Mac");
  });
});
