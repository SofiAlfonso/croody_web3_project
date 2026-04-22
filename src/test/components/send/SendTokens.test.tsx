import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SendTokens from "../../../components/send/SendTokens";
import { useWalletContext } from "../../../context/WalletContext";
import { useSendTokens } from "../../../hooks/useSendTokens";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("../../../context/WalletContext", () => ({ useWalletContext: vi.fn() }));
vi.mock("../../../hooks/useSendTokens", () => ({ useSendTokens: vi.fn() }));
vi.mock("../../../components/shared/AppHeader", () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <header><span>{title}</span>{children}</header>
  ),
}));
vi.mock("../../../components/shared/WalletBadge", () => ({ default: () => <div /> }));
vi.mock("../../../components/shared/BackToDashboardLink", () => ({ default: () => <a>Back</a> }));

const mockPush = vi.fn();
const mockSendTokens = vi.fn();

const WALLET = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as ReturnType<typeof useRouter>);
  vi.mocked(useWalletContext).mockReturnValue({
    walletAddress: WALLET,
    isConnected: true,
  } as ReturnType<typeof useWalletContext>);
  vi.mocked(useSendTokens).mockReturnValue({
    sendTokens: mockSendTokens,
    isPending: false,
    error: null,
  } as ReturnType<typeof useSendTokens>);
});

describe("SendTokens", () => {
  it("renders the form with recipient and amount inputs", () => {
    render(<SendTokens />);
    expect(screen.getByPlaceholderText("0x...")).toBeDefined();
    expect(screen.getByPlaceholderText("0.00")).toBeDefined();
  });

  it("shows shortened wallet address", () => {
    render(<SendTokens />);
    expect(screen.getByText("0xb1f9...8899")).toBeDefined();
  });

  it("redirects to / when not connected", async () => {
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: null,
      isConnected: false,
    } as ReturnType<typeof useWalletContext>);
    render(<SendTokens />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("Send Tokens button is disabled when fields are empty", () => {
    render(<SendTokens />);
    const btn = screen.getByRole("button", { name: "Send Tokens" });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it("Send Tokens button is enabled when both fields are filled", () => {
    render(<SendTokens />);
    fireEvent.change(screen.getByPlaceholderText("0x..."), { target: { value: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" } });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "100" } });
    const btn = screen.getByRole("button", { name: "Send Tokens" });
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it("shows success feedback and clears form on success", async () => {
    mockSendTokens.mockResolvedValue({ success: true, hash: "0xabc123hash" });
    render(<SendTokens />);
    fireEvent.change(screen.getByPlaceholderText("0x..."), { target: { value: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" } });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Tokens" }));
    await waitFor(() => expect(screen.getByText(/Tokens sent!/)).toBeDefined());
    expect((screen.getByPlaceholderText("0x...") as HTMLInputElement).value).toBe("");
  });

  it("shows success without hash", async () => {
    mockSendTokens.mockResolvedValue({ success: true, hash: undefined });
    render(<SendTokens />);
    fireEvent.change(screen.getByPlaceholderText("0x..."), { target: { value: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" } });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Tokens" }));
    await waitFor(() => expect(screen.getByText("Tokens sent successfully")).toBeDefined());
  });

  it("shows error feedback on failure", async () => {
    mockSendTokens.mockResolvedValue({ success: false, error: "Invalid recipient address" });
    render(<SendTokens />);
    fireEvent.change(screen.getByPlaceholderText("0x..."), { target: { value: "bad" } });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Tokens" }));
    await waitFor(() => expect(screen.getByText("Invalid recipient address")).toBeDefined());
  });

  it("Clear button resets form and feedback", async () => {
    mockSendTokens.mockResolvedValue({ success: true, hash: undefined });
    render(<SendTokens />);
    fireEvent.change(screen.getByPlaceholderText("0x..."), { target: { value: "0xabc" } });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect((screen.getByPlaceholderText("0x...") as HTMLInputElement).value).toBe("");
    expect((screen.getByPlaceholderText("0.00") as HTMLInputElement).value).toBe("");
  });

  it("shows Sending... when isPending is true", () => {
    vi.mocked(useSendTokens).mockReturnValue({
      sendTokens: mockSendTokens,
      isPending: true,
      error: null,
    } as ReturnType<typeof useSendTokens>);
    render(<SendTokens />);
    expect(screen.getByText("Sending...")).toBeDefined();
  });
});
