import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppRoutes } from "./routes";

describe("AppRoutes", () => {
  it("renders the about page at /about", () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /about appsearch/i })).toBeInTheDocument();
    expect(screen.getByText(/itunes search api/i)).toBeInTheDocument();
  });

  it("renders the not-found page for unknown routes", () => {
    render(
      <MemoryRouter initialEntries={["/missing-page"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText(/sorry, page not found/i)).toBeInTheDocument();
  });
});
