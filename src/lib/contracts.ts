/**
 * ABIs y addresses de los contratos
 *
 * TODO: Despues del deploy, agregar:
 * - ABI del ProjectToken (ERC-20)
 * - ABI del NFTCollection (ERC-721)
 * - ABI del NFTMarketplace
 * - Addresses por network
 */

export const PROJECT_TOKEN_ABI = [
  // TODO: Agregar ABI despues de compilar
  // Funciones ERC-20: transfer, approve, transferFrom, balanceOf, allowance
] as const;

export const NFT_COLLECTION_ABI = [
  // TODO: Agregar ABI despues de compilar
  // Funciones ERC-721: mint, transferFrom, approve, setApprovalForAll, ownerOf, tokenURI
] as const;

export const NFT_MARKETPLACE_ABI = [
  // TODO: Agregar ABI despues de compilar
  // Listings: listItem, buyItem, cancelListing
  // Auctions: createAuction, placeBid, endAuction
] as const;

export const CONTRACT_ADDRESSES = {
  localhost: {
    projectToken: "",
    nftCollection: "",
    marketplace: "",
  },
  sepolia: {
    projectToken: "",
    nftCollection: "",
    marketplace: "",
  },
  mainnet: {
    projectToken: "",
    nftCollection: "",
    marketplace: "",
  },
} as const;
