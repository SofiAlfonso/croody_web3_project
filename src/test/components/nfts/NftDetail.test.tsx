import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NftDetail from "../../../components/nfts/NftDetail";
import { useNftById } from "../../../hooks/useNfts";
import { useCreateAuction } from "../../../hooks/useCreateAuction";
import { useTransferNft } from "../../../hooks/useTransferNft";
import { useRouter } from "next/navigation";

// Mock Next router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock Next image wrapper
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => <img {...props} alt={props.alt} />,
}));

// Mock the AppHeader & ActionModal just enough so they render clearly testing logic
vi.mock("../../../components/shared/AppHeader", () => ({
  default: ({ children, title }: any) => (
    <header data-testid="app-header">
      <h1>{title}</h1>
      {children}
    </header>
  ),
}));

// Mock the hooks
vi.mock("../../../hooks/useNfts", () => ({
  useNftById: vi.fn(),
}));

vi.mock("../../../hooks/useCreateAuction", () => ({
  useCreateAuction: vi.fn(),
}));

vi.mock("../../../hooks/useTransferNft", () => ({
  useTransferNft: vi.fn(),
}));

describe("NftDetail Component - Auction Creation features", () => {
  const mockRouterPush = vi.fn();
  const mockCreateAuction = vi.fn();
  
  const mockNft = {
    id: "42",
    name: "Croody Web3 Tester",
    image: "/mock-nft.png",
    description: "Testing mock NFT details",
  };

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(useRouter).mockReturnValue({ push: mockRouterPush } as any);

    vi.mocked(useTransferNft).mockReturnValue({
      transferNft: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useNftById).mockReturnValue({
      data: mockNft,
      isLoading: false,
    } as any);

    vi.mocked(useCreateAuction).mockReturnValue({
      createAuction: mockCreateAuction,
      isPending: false,
    } as any);
  });

  it("renders loading state", () => {
    vi.mocked(useNftById).mockReturnValue({ isLoading: true, data: undefined } as any);
    render(<NftDetail id="42" />);
    expect(screen.getByText("Loading NFT details...")).toBeDefined();
  });

  it("renders not found state when no NFT is returned", () => {
    vi.mocked(useNftById).mockReturnValue({ isLoading: false, data: undefined } as any);
    render(<NftDetail id="999" />);
    expect(screen.getByText("NFT not found")).toBeDefined();
  });

  it("renders the NFT detail page correctly and opens Create Auction modal", async () => {
    render(<NftDetail id="42" />);
    
    expect(screen.getByText("Croody Web3 Tester")).toBeDefined();
    
    // Use getByRole to find the specific button
    const openAuctionBtn = screen.getByRole("button", { name: /Put NFT in Auction/i });
    fireEvent.click(openAuctionBtn);

    // After clicking, the modal should appear
    expect(screen.getAllByText("Create Auction").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Minimum Bid/i)).toBeDefined();
    expect(screen.getByLabelText(/Duration/i)).toBeDefined();
  });

  it("executes createAuction and redirects on success to the specific auction view", async () => {
    render(<NftDetail id="42" />);
    
    // Simulate setting up an auction
    mockCreateAuction.mockResolvedValue({ success: true, auctionId: "123" });

    // Open Modal
    fireEvent.click(screen.getByRole("button", { name: /Put NFT in Auction/i }));
    
    // Change input values
    const minBidInput = screen.getByLabelText(/Minimum Bid/i);
    const durationInput = screen.getByLabelText(/Duration/i);
    
    fireEvent.change(minBidInput, { target: { value: "300" } });
    fireEvent.change(durationInput, { target: { value: "48" } });

    // Click inside modal using aria-label / name
    // Since modal uses buttons for Confirm and Cancel:
    const confirmBtn = screen.getByRole("button", { name: "Create Auction" });
    fireEvent.click(confirmBtn);
    
    // Wait for the async hook to respond 
    await waitFor(() => {
      // 1. Verify hook was called with proper args
      expect(mockCreateAuction).toHaveBeenCalledWith({
        nftId: "42",
        minimumBid: "300",
        durationHours: 48,
      });

      // 2. Verify router redirect handled properly using the emitted auctionId
      expect(mockRouterPush).toHaveBeenCalledWith("/auction/123");
    });
  });

  it("executes createAuction and redirects to dashboard if auctionId is missing", async () => {
    render(<NftDetail id="42" />);
    
    // Simulate setting up an auction, but for some reason the RPC missed the auctionId
    mockCreateAuction.mockResolvedValue({ success: true, auctionId: undefined });

    // Open Modal and submit
    fireEvent.click(screen.getByRole("button", { name: /Put NFT in Auction/i }));
    fireEvent.click(screen.getByRole("button", { name: "Create Auction" }));
    
    await waitFor(() => {
      // Should fallback to dashboard
      expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});