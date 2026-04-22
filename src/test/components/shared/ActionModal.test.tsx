import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ActionModal from "../../../components/shared/ActionModal";

const baseProps = {
  isOpen: true,
  title: "Confirm Action",
  description: "Are you sure?",
  cancelLabel: "Cancel",
  confirmLabel: "Confirm",
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
};

describe("ActionModal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(<ActionModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders title and description when open", () => {
    render(<ActionModal {...baseProps} />);
    expect(screen.getByText("Confirm Action")).toBeDefined();
    expect(screen.getByText("Are you sure?")).toBeDefined();
  });

  it("renders cancel and confirm buttons", () => {
    render(<ActionModal {...baseProps} />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDefined();
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<ActionModal {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ActionModal {...baseProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("shows Processing... and disables confirm when isConfirming", () => {
    render(<ActionModal {...baseProps} isConfirming />);
    const btn = screen.getByRole("button", { name: "Processing..." });
    expect(btn).toBeDefined();
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders children inside the modal", () => {
    render(
      <ActionModal {...baseProps}>
        <div data-testid="modal-child">Child content</div>
      </ActionModal>,
    );
    expect(screen.getByTestId("modal-child")).toBeDefined();
  });
});
