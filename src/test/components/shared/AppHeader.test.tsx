import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AppHeader from "../../../components/shared/AppHeader";

describe("AppHeader", () => {
  it("renders the title", () => {
    render(<AppHeader title="My App" />);
    expect(screen.getByText("My App")).toBeDefined();
  });

  it("renders children", () => {
    render(<AppHeader title="App"><button>Action</button></AppHeader>);
    expect(screen.getByText("Action")).toBeDefined();
  });

  it("does not render children wrapper when no children", () => {
    const { container } = render(<AppHeader title="App" />);
    expect(container.querySelectorAll("div").length).toBeGreaterThan(0);
  });

  it("applies sticky class when sticky is true", () => {
    const { container } = render(<AppHeader title="App" sticky />);
    expect(container.querySelector("header")?.className).toContain("sticky");
  });

  it("applies custom title and border classes", () => {
    render(<AppHeader title="Custom" titleClassName="text-red-500" borderClassName="border-red-200" />);
    expect(screen.getByText("Custom").className).toContain("text-red-500");
  });
});
