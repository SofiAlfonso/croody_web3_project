import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BackToDashboardLink from "../../../components/shared/BackToDashboardLink";

describe("BackToDashboardLink", () => {
  it("renders Back to Dashboard text", () => {
    render(<BackToDashboardLink />);
    expect(screen.getByText("Back to Dashboard")).toBeDefined();
  });

  it("links to /dashboard", () => {
    render(<BackToDashboardLink />);
    const link = screen.getByRole("link", { name: "Back to Dashboard" });
    expect(link.getAttribute("href")).toBe("/dashboard");
  });
});
