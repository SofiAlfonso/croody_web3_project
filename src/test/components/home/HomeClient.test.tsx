import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomeClient from "../../../components/home/HomeClient";
import { useWalletContext } from "../../../context/WalletContext";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("../../../context/WalletContext", () => ({ useWalletContext: vi.fn() }));
vi.mock("../../../components/shared/AppHeader", () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <header><span>{title}</span>{children}</header>
  ),
}));
vi.mock("lucide-react", () => ({
  Layers: () => <svg />,
  Lock: () => <svg />,
  Shield: () => <svg />,
}));

const mockPush = vi.fn();
const mockConnectWallet = vi.fn();
const mockConnectDemo = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as ReturnType<typeof useRouter>);
  vi.mocked(useWalletContext).mockReturnValue({
    isConnected: false,
    isConnecting: false,
    connectWallet: mockConnectWallet,
    connectDemo: mockConnectDemo,
  } as ReturnType<typeof useWalletContext>);
});

describe("HomeClient", () => {
  it("renders Connect Wallet and Enter Demo Mode buttons", () => {
    render(<HomeClient />);
    expect(screen.getAllByText("Connect Wallet").length).toBeGreaterThan(0);
    expect(screen.getByText("Enter Demo Mode")).toBeDefined();
  });

  it("redirects to dashboard when already connected", async () => {
    vi.mocked(useWalletContext).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      connectWallet: mockConnectWallet,
      connectDemo: mockConnectDemo,
    } as ReturnType<typeof useWalletContext>);
    render(<HomeClient />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows Connecting... when isConnecting is true", () => {
    vi.mocked(useWalletContext).mockReturnValue({
      isConnected: false,
      isConnecting: true,
      connectWallet: mockConnectWallet,
      connectDemo: mockConnectDemo,
    } as ReturnType<typeof useWalletContext>);
    render(<HomeClient />);
    expect(screen.getAllByText("Connecting...").length).toBeGreaterThan(0);
  });

  it("calls connectWallet and redirects on success", async () => {
    mockConnectWallet.mockResolvedValue("0xabc");
    render(<HomeClient />);
    fireEvent.click(screen.getAllByText("Connect Wallet")[0]);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("does not redirect when connectWallet returns null", async () => {
    mockConnectWallet.mockResolvedValue(null);
    render(<HomeClient />);
    fireEvent.click(screen.getAllByText("Connect Wallet")[0]);
    await waitFor(() => expect(mockConnectWallet).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalledWith("/dashboard");
  });

  it("calls connectDemo and pushes to dashboard on demo click", () => {
    render(<HomeClient />);
    fireEvent.click(screen.getByText("Enter Demo Mode"));
    expect(mockConnectDemo).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
