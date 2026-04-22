import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuctionDetail from "../../../components/auction/AuctionDetail";
import { useWalletContext } from "../../../context/WalletContext";
import { useAuctionById } from "../../../hooks/useAuctions";
import { useEndAuction } from "../../../hooks/useEndAuction";
import { useCancelAuction } from "../../../hooks/useCancelAuction";
import { usePlaceBid } from "../../../hooks/usePlaceBid";
import { useRouter } from "next/navigation";

// Mock Next.js dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => <img {...props} alt={props.alt} />,
}));

// Mock Custom Hooks
vi.mock("../../../context/WalletContext", () => ({
  useWalletContext: vi.fn(),
}));

vi.mock("../../../hooks/useAuctions", () => ({
  useAuctionById: vi.fn(),
}));

vi.mock("../../../hooks/useEndAuction", () => ({
  useEndAuction: vi.fn(),
}));

vi.mock("../../../hooks/useCancelAuction", () => ({
  useCancelAuction: vi.fn(),
}));

vi.mock("../../../hooks/usePlaceBid", () => ({
  usePlaceBid: vi.fn(),
}));

// Mock minimal structural dependencies to prevent cluttering the dom
vi.mock("../../../components/shared/AppHeader", () => ({
  default: ({ children }: any) => <header data-testid="app-header">{children}</header>,
}));
vi.mock("../../../components/shared/WalletBadge", () => ({
  default: () => <div data-testid="wallet-badge" />,
}));
vi.mock("../../../components/shared/BackToDashboardLink", () => ({
  default: () => <a data-testid="back-link">Back</a>,
}));

describe("AuctionDetail UI features", () => {
  const mockRouterPush = vi.fn();
  const mockPlaceBid = vi.fn();
  const mockEndAuction = vi.fn();
  const mockCancelAuction = vi.fn();

  const futureEndTime = Math.floor(Date.now() / 1000) + 7200;
  const pastEndTime = Math.floor(Date.now() / 1000) - 1;

  const mockAuction = {
    id: "1",
    name: "Croody NFT #1",
    image: "/mock-image.png",
    currentBid: 100,
    startPrice: 50,
    timeLeft: "2 hours",
    endTime: futureEndTime,
    ownerAddress: "0x123owner",
    highestBidder: null,
    status: "Live",
  };

  const expiredAuction = { ...mockAuction, endTime: pastEndTime, timeLeft: "0m" };

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(useRouter).mockReturnValue({ push: mockRouterPush } as any);
    
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: "0x456bidder",
    } as any);

    vi.mocked(useAuctionById).mockReturnValue({
      data: mockAuction,
    } as any);

    vi.mocked(usePlaceBid).mockReturnValue({
      placeBid: mockPlaceBid,
      isPending: false,
    } as any);

    vi.mocked(useEndAuction).mockReturnValue({
      endAuction: mockEndAuction,
      isPending: false,
    } as any);

    vi.mocked(useCancelAuction).mockReturnValue({
      cancelAuction: mockCancelAuction,
      isPending: false,
    } as any);
  });

  it("renders NotFoundState when auction is not found (Empty State Testing)", () => {
    vi.mocked(useAuctionById).mockReturnValue({ data: undefined } as any);

    render(<AuctionDetail id="999" />);
    
    expect(screen.getByText("Auction not found")).toBeDefined();
    expect(screen.getByText("Choose an auction from the dashboard.")).toBeDefined();
  });

  it("renders auction details and Place Bid button for non-owner (Bidding Logic)", () => {
    render(<AuctionDetail id="1" />);

    expect(screen.getByText("Croody NFT #1")).toBeDefined();
    expect(screen.getByText("100 CRD")).toBeDefined();
    expect(screen.getByText("2 hours left")).toBeDefined();
    expect(screen.getByRole("button", { name: "Place Bid" })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Close Auction/i })).toBeNull();
  });

  it("renders Close Auction button and owner view when wallet matches ownerAddress (Owner Gating)", () => {
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: "0x123OWNER", // testing case insensitivity mapping
    } as any);
    vi.mocked(useAuctionById).mockReturnValue({ data: expiredAuction } as any);

    render(<AuctionDetail id="1" />);

    expect(screen.getByRole("button", { name: "Close Auction" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Place Bid" })).toBeNull();
  });

  it("disables Close Auction button when transaction is pending", () => {
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: "0x123owner",
    } as any);
    vi.mocked(useAuctionById).mockReturnValue({ data: expiredAuction } as any);
    vi.mocked(useEndAuction).mockReturnValue({
      endAuction: mockEndAuction,
      isPending: true,
    } as any);

    render(<AuctionDetail id="1" />);

    const closeBtn = screen.getByRole("button", { name: "Closing Auction..." });
    expect((closeBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("redirects on closing auction successfully (Redirect Logic)", async () => {
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: "0x123owner",
    } as any);
    vi.mocked(useAuctionById).mockReturnValue({ data: expiredAuction } as any);

    mockEndAuction.mockResolvedValue({ success: true });

    render(<AuctionDetail id="1" />);

    const closeBtn = screen.getByRole("button", { name: "Close Auction" });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(mockEndAuction).toHaveBeenCalledWith({ auctionId: "1" });
      expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("HU-15: Place Bid button opens bid dialog (non-owner, non-expired)", () => {
    render(<AuctionDetail id="1" />);
    fireEvent.click(screen.getByRole("button", { name: "Place Bid" }));
    expect(screen.getByText("Place a Bid")).toBeDefined();
  });

  it("HU-15: submits bid and calls placeBid with correct params", async () => {
    mockPlaceBid.mockResolvedValue({ success: true });
    render(<AuctionDetail id="1" />);
    fireEvent.click(screen.getByRole("button", { name: "Place Bid" }));
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "200" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit Bid" }));
    await waitFor(() => {
      expect(mockPlaceBid).toHaveBeenCalledWith({ auctionId: "1", amount: "200" });
    });
  });

  it("HU-17: does not redirect when endAuction returns failure", async () => {
    vi.mocked(useWalletContext).mockReturnValue({ walletAddress: "0x123owner" } as any);
    vi.mocked(useAuctionById).mockReturnValue({ data: expiredAuction } as any);
    mockEndAuction.mockResolvedValue({ success: false });
    render(<AuctionDetail id="1" />);
    fireEvent.click(screen.getByRole("button", { name: "Close Auction" }));
    await waitFor(() => expect(mockEndAuction).toHaveBeenCalled());
    expect(mockRouterPush).not.toHaveBeenCalledWith("/dashboard");
  });

  it("HU-15: Place Bid button is disabled when auction is expired", () => {
    vi.mocked(useAuctionById).mockReturnValue({ data: expiredAuction } as any);
    render(<AuctionDetail id="1" />);
    const btn = screen.queryByRole("button", { name: "Place Bid" });
    if (btn) expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});
