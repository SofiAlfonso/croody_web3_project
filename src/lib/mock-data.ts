export type Trait = {
  type: string;
  value: string;
  rarity?: string; // e.g. "12% have this"
};

export type NFT = {
  id: string;
  name: string;
  image: string;
  ownerAddress?: string;
  collection?: string;
  description?: string;
  floorPrice?: number; // in CRD
  traits?: Trait[];
};

const DEMO_ADDRESS = "0xDEM0000000000000000000000000000000000000";
const SAMPLE_OWNER_A = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const SAMPLE_OWNER_B = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

export type Auction = {
  id: string;
  name: string;
  image: string;
  currentBid: number;
  startPrice: number;
  timeLeft: string;
  endTime: number;
  ownerAddress: string;
  highestBidder: string | null;
  status: "Live" | "Ended";
};

export const mockNFTs: NFT[] = [
  {
    id: "001",
    name: "Croody Ape #001",
    image: "https://picsum.photos/seed/croody1/600/600",
    ownerAddress: DEMO_ADDRESS,
    collection: "Croody Genesis",
    description:
      "One of the original Croody Genesis apes. Grants VIP access to all Croody auctions and future drops.",
    floorPrice: 420,
    traits: [
      { type: "Background", value: "Jungle Green", rarity: "8% have this" },
      { type: "Eyes", value: "Laser", rarity: "3% have this" },
      { type: "Mouth", value: "Gold Grills", rarity: "5% have this" },
      { type: "Hat", value: "Crown", rarity: "2% have this" },
      { type: "Fur", value: "Electric Blue", rarity: "6% have this" },
    ],
  },
  {
    id: "002",
    name: "Croody Ape #002",
    image: "https://picsum.photos/seed/croody2/600/600",
    ownerAddress: DEMO_ADDRESS,
    collection: "Croody Genesis",
    description: "A rare Croody Genesis ape with distinctive features from the founding batch.",
    floorPrice: 380,
    traits: [
      { type: "Background", value: "Sunset Orange", rarity: "12% have this" },
      { type: "Eyes", value: "3D Glasses", rarity: "7% have this" },
      { type: "Mouth", value: "Smirk", rarity: "15% have this" },
      { type: "Hat", value: "Beanie", rarity: "10% have this" },
      { type: "Fur", value: "Golden", rarity: "4% have this" },
    ],
  },
  {
    id: "003",
    name: "Croody Ape #003",
    image: "https://picsum.photos/seed/croody3/600/600",
    ownerAddress: DEMO_ADDRESS,
    collection: "Croody Genesis",
    description:
      "A member of the original Croody Genesis collection — each one unique, each one legendary.",
    floorPrice: 395,
    traits: [
      { type: "Background", value: "Deep Ocean", rarity: "9% have this" },
      { type: "Eyes", value: "Sleepy", rarity: "18% have this" },
      { type: "Mouth", value: "Cigar", rarity: "6% have this" },
      { type: "Hat", value: "Fedora", rarity: "11% have this" },
      { type: "Fur", value: "Diamond", rarity: "1% have this" },
    ],
  },
  {
    id: "004",
    name: "Croody Ape #004",
    image: "https://picsum.photos/seed/croody4/600/600",
    ownerAddress: SAMPLE_OWNER_A,
    collection: "Croody Genesis",
    description:
      "Genesis ape carrying the spirit of the Croody blockchain. A true piece of Web3 history.",
    floorPrice: 410,
    traits: [
      { type: "Background", value: "Purple Haze", rarity: "7% have this" },
      { type: "Eyes", value: "Heart", rarity: "5% have this" },
      { type: "Mouth", value: "Tongue Out", rarity: "9% have this" },
      { type: "Hat", value: "None", rarity: "40% have this" },
      { type: "Fur", value: "Rainbow", rarity: "2% have this" },
    ],
  },
  {
    id: "005",
    name: "Croody Ape #005",
    image: "https://picsum.photos/seed/croody5/600/600",
    ownerAddress: SAMPLE_OWNER_A,
    collection: "Croody Genesis",
    description: "The fifth Genesis ape — a symbol of resilience in the Croody ecosystem.",
    floorPrice: 370,
    traits: [
      { type: "Background", value: "Neon Pink", rarity: "6% have this" },
      { type: "Eyes", value: "Angry", rarity: "12% have this" },
      { type: "Mouth", value: "Diamond Grill", rarity: "4% have this" },
      { type: "Hat", value: "Top Hat", rarity: "8% have this" },
      { type: "Fur", value: "Silver", rarity: "3% have this" },
    ],
  },
  {
    id: "006",
    name: "Croody Ape #006",
    image: "https://picsum.photos/seed/croody6/600/600",
    ownerAddress: SAMPLE_OWNER_B,
    collection: "Croody Genesis",
    description: "Born from the sixth mint of the Genesis collection. Rare and coveted.",
    floorPrice: 360,
    traits: [
      { type: "Background", value: "Arctic White", rarity: "5% have this" },
      { type: "Eyes", value: "Neon", rarity: "8% have this" },
      { type: "Mouth", value: "Pipe", rarity: "7% have this" },
      { type: "Hat", value: "Wizard Hat", rarity: "3% have this" },
      { type: "Fur", value: "Cheetah Print", rarity: "2% have this" },
    ],
  },
  {
    id: "007",
    name: "Neon Relic #001",
    image: "https://picsum.photos/seed/croody7/600/600",
    ownerAddress: SAMPLE_OWNER_B,
    collection: "Neon Relics",
    description:
      "A glowing artifact from the Neon Relics series. Forged in the digital underground.",
    floorPrice: 280,
    traits: [
      { type: "Glow Color", value: "Cyan", rarity: "20% have this" },
      { type: "Material", value: "Plasma Glass", rarity: "10% have this" },
      { type: "Age", value: "Ancient", rarity: "5% have this" },
      { type: "Symbol", value: "Infinity Loop", rarity: "8% have this" },
    ],
  },
  {
    id: "008",
    name: "Neon Relic #002",
    image: "https://picsum.photos/seed/croody8/600/600",
    ownerAddress: SAMPLE_OWNER_B,
    collection: "Neon Relics",
    description: "The second Neon Relic — pulsing with raw blockchain energy.",
    floorPrice: 265,
    traits: [
      { type: "Glow Color", value: "Magenta", rarity: "18% have this" },
      { type: "Material", value: "Obsidian", rarity: "12% have this" },
      { type: "Age", value: "Primordial", rarity: "3% have this" },
      { type: "Symbol", value: "Fractal", rarity: "6% have this" },
    ],
  },
  {
    id: "009",
    name: "Pixel Degen #001",
    image: "https://picsum.photos/seed/croody9/600/600",
    ownerAddress: DEMO_ADDRESS,
    collection: "Pixel Degens",
    description:
      "A pixelated degen straight from the art blocks. Built for those who HODL through it all.",
    floorPrice: 150,
    traits: [
      { type: "Pixel Density", value: "8-bit", rarity: "30% have this" },
      { type: "Vibe", value: "Diamond Hands", rarity: "15% have this" },
      { type: "Accessory", value: "Moon Rocket", rarity: "7% have this" },
      { type: "Color Palette", value: "Retro CRT", rarity: "10% have this" },
    ],
  },
];

export const mockAuctions: Auction[] = [
  {
    id: "a1",
    name: "Genesis Relic",
    image: "https://picsum.photos/seed/auction1/600/600",
    currentBid: 120,
    startPrice: 100,
    timeLeft: "2h 14m",
    endTime: Math.floor(Date.now() / 1000) + 8040,
    ownerAddress: "0xA3f...92B",
    highestBidder: null,
    status: "Live",
  },
  {
    id: "a2",
    name: "Pixel Dragon",
    image: "https://picsum.photos/seed/auction2/600/600",
    currentBid: 78,
    startPrice: 50,
    timeLeft: "5h 03m",
    endTime: Math.floor(Date.now() / 1000) + 18180,
    ownerAddress: "0xOwner...D2C",
    highestBidder: null,
    status: "Live",
  },
  {
    id: "a3",
    name: "Neon Artifact",
    image: "https://picsum.photos/seed/auction3/600/600",
    currentBid: 220,
    startPrice: 200,
    timeLeft: "1d 02h",
    endTime: Math.floor(Date.now() / 1000) + 93600,
    ownerAddress: "0xZ99...B11",
    highestBidder: null,
    status: "Live",
  },
];
