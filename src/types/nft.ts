/**
 * Tipos relacionados con NFTs
 */

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFT {
  tokenId: bigint;
  tokenURI: string;
  owner: `0x${string}`;
  metadata?: NFTMetadata;
}
