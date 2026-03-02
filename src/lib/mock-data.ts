export type NFT = {
  id: string;
  name: string;
  image: string;
};

export type Auction = {
  id: string;
  name: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  ownerAddress: string;
  status: "Live" | "Ended";
};

export const mockNFTs: NFT[] = [
  { id: "001", name: "Croody Ape #001", image: "https://picsum.photos/seed/croody1/600/600" },
  { id: "002", name: "Croody Ape #002", image: "https://picsum.photos/seed/croody2/600/600" },
  { id: "003", name: "Croody Ape #003", image: "https://picsum.photos/seed/croody3/600/600" },
  { id: "004", name: "Croody Ape #004", image: "https://picsum.photos/seed/croody4/600/600" },
];

export const mockAuctions: Auction[] = [
  {
    id: "a1",
    name: "Genesis Relic",
    image: "https://picsum.photos/seed/auction1/600/600",
    currentBid: 120,
    timeLeft: "2h 14m",
    ownerAddress: "0xA3f...92B",
    status: "Live",
  },
  {
    id: "a2",
    name: "Pixel Dragon",
    image: "https://picsum.photos/seed/auction2/600/600",
    currentBid: 78,
    timeLeft: "5h 03m",
    ownerAddress: "0xOwner...D2C",
    status: "Live",
  },
  {
    id: "a3",
    name: "Neon Artifact",
    image: "https://picsum.photos/seed/auction3/600/600",
    currentBid: 220,
    timeLeft: "1d 02h",
    ownerAddress: "0xZ99...B11",
    status: "Live",
  },
];