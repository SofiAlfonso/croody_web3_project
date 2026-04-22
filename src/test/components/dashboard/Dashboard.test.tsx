import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "../../../components/dashboard/Dashboard";
import { useWalletContext } from "../../../context/WalletContext";
import { useMyNfts } from "../../../hooks/useNfts";
import { useMyAuctions, useLiveAuctions } from "../../../hooks/useAuctions";
import { useWalletBalance } from "../../../hooks/useWalletBalance";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("../../../context/WalletContext", () => ({ useWalletContext: vi.fn() }));
vi.mock("../../../hooks/useNfts", () => ({ useMyNfts: vi.fn() }));
vi.mock("../../../hooks/useAuctions", () => ({
  useMyAuctions: vi.fn(),
  useLiveAuctions: vi.fn(),
}));
vi.mock("../../../hooks/useWalletBalance", () => ({ useWalletBalance: vi.fn() }));
vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: any) => <img {...props} alt={props.alt} />,
}));
vi.mock("../../../components/shared/AppHeader", () => ({
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <header><span>{title}</span>{children}</header>
  ),
}));
vi.mock("lucide-react", () => ({ ArrowUpRight: () => <svg />, Clock: () => <svg /> }));

const WALLET = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";
const mockPush = vi.fn();
const mockDisconnect = vi.fn();

const mockNft = { id: "1", name: "Croody NFT #1", image: "/nft.png", collection: "Genesis" };

const mockAuction = {
  id: "1", name: "Auction NFT", image: "/auction.png",
  currentBid: 100, startPrice: 50, timeLeft: "2h",
  endTime: 9999999, ownerAddress: WALLET, highestBidder: null, status: "Live",
};

const otherAuction = { ...mockAuction, id: "2", ownerAddress: "0xother000000000000000000000000000000000000" };

function mockWallet(overrides = {}) {
  vi.mocked(useWalletContext).mockReturnValue({
    walletAddress: WALLET, isConnected: true, isDemo: false,
    disconnectWallet: mockDisconnect, isConnecting: false,
    connectWallet: vi.fn(), connectDemo: vi.fn(), chainId: "0x539",
    ...overrides,
  } as unknown as ReturnType<typeof useWalletContext>);
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush, back: vi.fn(), forward: vi.fn(),
    refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);
  mockWallet();
  vi.mocked(useWalletBalance).mockReturnValue({ amount: "1,000", symbol: "CRD", isLoading: false, isError: false });
  vi.mocked(useMyNfts).mockReturnValue({ data: [], isLoading: false, error: null } as ReturnType<typeof useMyNfts>);
  vi.mocked(useMyAuctions).mockReturnValue({ data: [], isLoading: false, error: null } as ReturnType<typeof useMyAuctions>);
  vi.mocked(useLiveAuctions).mockReturnValue({ data: [], isLoading: false, error: null } as ReturnType<typeof useLiveAuctions>);
});

describe("Dashboard", () => {
  it("renders token balance", () => {
    render(<Dashboard />);
    expect(screen.getByText("1,000 CRD")).toBeDefined();
  });

  it("shows Loading... while balance is loading", () => {
    vi.mocked(useWalletBalance).mockReturnValue({ amount: "0", symbol: "CRD", isLoading: true, isError: false });
    render(<Dashboard />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("shows balance error when isError is true", () => {
    vi.mocked(useWalletBalance).mockReturnValue({ amount: "0", symbol: "CRD", isLoading: false, isError: true });
    render(<Dashboard />);
    expect(screen.getByText(/Could not fetch on-chain balance/)).toBeDefined();
  });

  it("shows No NFTs empty state when wallet has no NFTs", () => {
    render(<Dashboard />);
    expect(screen.getByText("No NFTs yet")).toBeDefined();
  });

  it("renders NFT cards when nfts are available", () => {
    vi.mocked(useMyNfts).mockReturnValue({ data: [mockNft], isLoading: false, error: null } as ReturnType<typeof useMyNfts>);
    render(<Dashboard />);
    expect(screen.getByText("Croody NFT #1")).toBeDefined();
    expect(screen.getByText("ID: 1")).toBeDefined();
  });

  it("shows owner auction buttons when auction belongs to connected wallet", () => {
    vi.mocked(useMyAuctions).mockReturnValue({ data: [mockAuction], isLoading: false, error: null } as ReturnType<typeof useMyAuctions>);
    render(<Dashboard />);
    expect(screen.getByText("Close Auction")).toBeDefined();
    expect(screen.getByText("Cancel Auction")).toBeDefined();
  });

  it("shows View Auction link when auction belongs to other wallet", () => {
    vi.mocked(useMyAuctions).mockReturnValue({ data: [otherAuction], isLoading: false, error: null } as ReturnType<typeof useMyAuctions>);
    render(<Dashboard />);
    expect(screen.getByText("View Auction")).toBeDefined();
  });

  it("shows live auctions from other wallets", () => {
    vi.mocked(useLiveAuctions).mockReturnValue({ data: [otherAuction], isLoading: false, error: null } as ReturnType<typeof useLiveAuctions>);
    render(<Dashboard />);
    expect(screen.getByText("Auction NFT")).toBeDefined();
  });

  it("shows demo banner in demo mode", () => {
    mockWallet({ isDemo: true, walletAddress: "0xDEM0" });
    render(<Dashboard />);
    expect(screen.getByText(/Demo Mode/)).toBeDefined();
  });

  it("calls disconnectWallet and redirects on disconnect", () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText("Disconnect"));
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("redirects to / when not connected", () => {
    mockWallet({ walletAddress: null, isConnected: false });
    render(<Dashboard />);
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
