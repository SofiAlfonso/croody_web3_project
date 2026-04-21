import deployedAddresses from "@/lib/deployed-addresses.json";

type DeployedAddresses = {
  contracts?: {
    nftCollection?: string;
    projectToken?: string;
    nftMarketplace?: string;
  };
};

const deployed = deployedAddresses as DeployedAddresses;

function toChecksumAddress(candidate: string | undefined): `0x${string}` | null {
  if (!candidate || !candidate.startsWith("0x") || candidate.length !== 42) {
    return null;
  }
  return candidate as `0x${string}`;
}

export function getNftCollectionAddress(): `0x${string}` | null {
  const candidate =
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS ||
    deployed.contracts?.nftCollection;
  return toChecksumAddress(candidate);
}

export function getProjectTokenAddress(): `0x${string}` | null {
  const candidate =
    process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS ||
    deployed.contracts?.projectToken;
  return toChecksumAddress(candidate);
}

export function getMarketplaceAddress(): `0x${string}` | null {
  const candidate =
    process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS ||
    deployed.contracts?.nftMarketplace;
  return toChecksumAddress(candidate);
}

export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
