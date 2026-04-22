import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NftGallery from "../../../components/nfts/NftGallery";
import { useWalletContext } from "../../../context/WalletContext";
import { useMyNfts } from "../../../hooks/useNfts";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("../../../context/WalletContext", () => ({ useWalletContext: vi.fn() }));
vi.mock("../../../hooks/useNfts", () => ({ useMyNfts: vi.fn() }));
vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: any) => <img {...props} alt={props.alt} />,
}));
vi.mock("../../../components/shared/AppHeader", () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <header><span>{title}</span>{children}</header>
  ),
}));
vi.mock("../../../components/shared/BackToDashboardLink", () => ({ default: () => <a>Back</a> }));
vi.mock("lucide-react", () => ({ Search: () => <svg />, ImageOff: () => <svg /> }));

const mockPush = vi.fn();

const mockNfts = [
  { id: "1", name: "Croody NFT #1", image: "/img1.png", collection: "Croody Genesis" },
  { id: "2", name: "Pixel NFT #2", image: "/img2.png", collection: "Pixel Degens" },
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: mockPush, back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn() } as ReturnType<typeof useRouter>);
  vi.mocked(useWalletContext).mockReturnValue({
    walletAddress: "0xabc",
    isConnected: true,
    isDemo: false,
  } as ReturnType<typeof useWalletContext>);
  vi.mocked(useMyNfts).mockReturnValue({
    data: mockNfts,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useMyNfts>);
});

describe("NftGallery", () => {
  it("renders NFT names", () => {
    render(<NftGallery />);
    expect(screen.getByText("Croody NFT #1")).toBeDefined();
    expect(screen.getByText("Pixel NFT #2")).toBeDefined();
  });

  it("shows loading skeleton when isLoading is true", () => {
    vi.mocked(useMyNfts).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    } as ReturnType<typeof useMyNfts>);
    render(<NftGallery />);
    expect(screen.getByText("Loading…")).toBeDefined();
  });

  it("filters NFTs by search term", () => {
    render(<NftGallery />);
    fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: "Croody" } });
    expect(screen.getByText("Croody NFT #1")).toBeDefined();
    expect(screen.queryByText("Pixel NFT #2")).toBeNull();
  });

  it("shows empty state when search has no results", () => {
    render(<NftGallery />);
    fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: "zzz" } });
    expect(screen.getByText("No NFTs found")).toBeDefined();
  });

  it("filters by collection", () => {
    render(<NftGallery />);
    fireEvent.click(screen.getByRole("button", { name: "Pixel Degens" }));
    expect(screen.getByText("Pixel NFT #2")).toBeDefined();
    expect(screen.queryByText("Croody NFT #1")).toBeNull();
  });

  it("shows all NFTs when All filter is selected", () => {
    render(<NftGallery />);
    fireEvent.click(screen.getByRole("button", { name: "Pixel Degens" }));
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Croody NFT #1")).toBeDefined();
    expect(screen.getByText("Pixel NFT #2")).toBeDefined();
  });

  it("redirects to / when not connected", () => {
    vi.mocked(useWalletContext).mockReturnValue({
      walletAddress: null,
      isConnected: false,
      isDemo: false,
    } as ReturnType<typeof useWalletContext>);
    render(<NftGallery />);
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
