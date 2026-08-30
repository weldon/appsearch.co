import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "../pages/HomePage";
import * as appStoreSearch from "../services/appStoreSearch";
import type { AppSearchResult } from "../types/appSearchResult";

vi.mock("../services/appStoreSearch", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/appStoreSearch")>();
  return {
    ...actual,
    searchApps: vi.fn(),
  };
});

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.mocked(appStoreSearch.searchApps).mockReset();
  });

  it("shows a spinner while a platform search is in progress", async () => {
    vi.mocked(appStoreSearch.searchApps).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve([
                {
                  trackId: 1,
                  trackName: "Test App",
                  bundleId: "com.test",
                  artworkUrl512: "https://example.com/icon.png",
                  trackViewUrl: "https://apps.apple.com/app/test/id1",
                  platformLabel: "iPhone",
                },
              ]),
            100,
          );
        }),
    );

    const user = userEvent.setup();
    renderHomePage();

    await user.type(screen.getByLabelText(/enter an app name below/i), "test");
    await user.click(screen.getByRole("radio", { name: /^iphone$/i }));

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/searching the app store/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/1 results/i)).toBeInTheDocument();
    });
  });

  it("searches only the selected platform", async () => {
    vi.mocked(appStoreSearch.searchApps).mockResolvedValue([]);

    const user = userEvent.setup();
    renderHomePage();

    await user.type(screen.getByLabelText(/enter an app name below/i), "xcode");
    await user.click(screen.getByRole("radio", { name: /^mac$/i }));

    await waitFor(() => {
      expect(appStoreSearch.searchApps).toHaveBeenCalledWith("xcode", "mac");
    });
    expect(appStoreSearch.searchApps).toHaveBeenCalledTimes(1);
  });

  it("re-runs the search when the platform changes", async () => {
    vi.mocked(appStoreSearch.searchApps).mockResolvedValue([]);

    const user = userEvent.setup();
    renderHomePage();

    await user.type(screen.getByLabelText(/enter an app name below/i), "word");
    await user.click(screen.getByRole("radio", { name: /^iphone$/i }));
    await user.click(screen.getByRole("radio", { name: /^mac$/i }));

    await waitFor(() => {
      expect(appStoreSearch.searchApps).toHaveBeenCalledWith("word", "iphone");
      expect(appStoreSearch.searchApps).toHaveBeenCalledWith("word", "mac");
    });
    expect(appStoreSearch.searchApps).toHaveBeenCalledTimes(2);
  });

  it("warns when a platform is selected with an empty search term", async () => {
    const user = userEvent.setup();
    renderHomePage();

    await user.click(screen.getByRole("radio", { name: /^mac$/i }));

    expect(
      screen.getByText(/enter a search term before selecting a platform/i),
    ).toBeInTheDocument();
    expect(appStoreSearch.searchApps).not.toHaveBeenCalled();
  });

  it("does not overwrite newer results with a stale response", async () => {
    let resolveFirst: ((value: AppSearchResult[]) => void) | undefined;
    let resolveSecond: ((value: AppSearchResult[]) => void) | undefined;

    vi.mocked(appStoreSearch.searchApps)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
      );

    const user = userEvent.setup();
    renderHomePage();

    await user.type(screen.getByLabelText(/enter an app name below/i), "query");
    await user.click(screen.getByRole("radio", { name: /^iphone$/i }));
    await user.click(screen.getByRole("radio", { name: /^mac$/i }));

    resolveSecond?.([
      {
        trackId: 2,
        trackName: "Mac App",
        bundleId: "com.mac",
        artworkUrl512: "https://example.com/mac.png",
        trackViewUrl: "https://apps.apple.com/app/mac/id2",
        platformLabel: "Mac",
      },
    ]);

    await waitFor(() => {
      expect(screen.getByText(/mac app/i)).toBeInTheDocument();
    });

    resolveFirst?.([
      {
        trackId: 1,
        trackName: "iPhone App",
        bundleId: "com.iphone",
        artworkUrl512: "https://example.com/iphone.png",
        trackViewUrl: "https://apps.apple.com/app/iphone/id1",
        platformLabel: "iPhone",
      },
    ]);

    expect(screen.queryByText(/iphone app/i)).not.toBeInTheDocument();
    expect(screen.getByText(/mac app/i)).toBeInTheDocument();
  });
});
