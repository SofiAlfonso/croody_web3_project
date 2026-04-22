import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundState from "../../../components/shared/NotFoundState";

describe("NotFoundState", () => {
  it("renders title and description", () => {
    render(<NotFoundState title="Not Found" description="This page does not exist." />);
    expect(screen.getByText("Not Found")).toBeDefined();
    expect(screen.getByText("This page does not exist.")).toBeDefined();
  });

  it("applies default max width class", () => {
    const { container } = render(<NotFoundState title="T" description="D" />);
    expect(container.querySelector(".max-w-6xl")).toBeDefined();
  });

  it("applies custom max width class", () => {
    const { container } = render(<NotFoundState title="T" description="D" maxWidthClassName="max-w-2xl" />);
    expect(container.querySelector(".max-w-2xl")).toBeDefined();
  });
});
