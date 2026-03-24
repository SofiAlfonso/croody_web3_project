import deployedAddresses from "@/lib/deployed-addresses.json";

type DeployedAddresses = {
  contracts?: {
    nftCollection?: string;
  };
};

const deployed = deployedAddresses as DeployedAddresses;

export function getNftCollectionAddress(): `0x${string}` | null {
  const fromEnv = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
  const fromJson = deployed.contracts?.nftCollection;
  const candidate = fromEnv || fromJson;

  if (!candidate || !candidate.startsWith("0x") || candidate.length !== 42) {
    return null;
  }

  return candidate as `0x${string}`;
}
