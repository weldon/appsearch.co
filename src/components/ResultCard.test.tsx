import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResultCard } from "./ResultCard";
import { copyToClipboard } from "../utils/copyToClipboard";

vi.mock("../utils/copyToClipboard", () => ({
  copyToClipboard: vi.fn(),
}));

describe("ResultCard", () => {
  beforeEach(() => {
    vi.mocked(copyToClipboard).mockResolvedValue(true);
  });

  it("copies the bundle ID to the clipboard", async () => {
    const user = userEvent.setup();

    render(
      <ResultCard
        result={{
          trackId: 1,
          trackName: "Test App",
          bundleId: "com.example.test",
          artworkUrl512: "https://example.com/icon.png",
          trackViewUrl: "https://apps.apple.com/app/test/id1",
          platformLabel: "iPhone",
        }}
        showPlatformBadge={false}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /copy bundle id com.example.test/i }),
    );

    await waitFor(() => {
      expect(copyToClipboard).toHaveBeenCalledWith("com.example.test");
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /copied bundle id com.example.test/i }),
      ).toBeInTheDocument();
    });
  });
});
