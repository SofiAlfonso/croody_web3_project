import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WalletBadge from "../../../components/shared/WalletBadge";
import { useWalletContext } from "../../../context/WalletContext";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("../../../context/WalletContext", () => ({ useWalletContext: vi.fn() }));

const mockPush = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush, back: vi.fn(), forward: vi.fn(),
    refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);
});

describe("WalletBadge", () => {
  it("shows shortened wallet address in connected mode", () => {
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899",
      isDemo: false,
      disconnectWallet: mockDisconnect,
    } as unknown as ReturnType<typeof useWalletContext>);
    render(<WalletBadge />);
    expect(screen.getByText("0xb1f9...8899")).toBeDefined();
    expect(screen.getByText("Connected")).toBeDefined();
  });

  it("shows Demo User and Demo badge in demo mode", () => {
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: "0xDEM0000000000000000000000000000000000000",
      isDemo: true,
      disconnectWallet: mockDisconnect,
    } as unknown as ReturnType<typeof useWalletContext>);
    render(<WalletBadge />);
    expect(screen.getByText("Demo User")).toBeDefined();
    expect(screen.getByText("Demo")).toBeDefined();
  });

  it("calls disconnectWallet and redirects to / on click", () => {
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899",
      isDemo: false,
      disconnectWallet: mockDisconnect,
    } as unknown as ReturnType<typeof useWalletContext>);
    render(<WalletBadge />);
    fireEvent.click(screen.getByText("Disconnect"));
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows empty string when walletAddress is null", () => {
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: null,
      isDemo: false,
      disconnectWallet: mockDisconnect,
    } as unknown as ReturnType<typeof useWalletContext>);
    render(<WalletBadge />);
    expect(screen.getByText("Connected")).toBeDefined();
  });
});
