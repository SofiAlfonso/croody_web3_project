// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title NFTMarketplace
 * @dev Contrato principal del marketplace de NFTs
 *
 * IMPORTANTE: Este marketplace usa ProjectToken (ERC-20) como moneda de pago,
 * NO ETH nativo. Los compradores deben hacer approve() del token antes de comprar/pujar.
 *
 * TODO: Implementar las siguientes funcionalidades:
 *
 * LISTINGS (Precio Fijo):
 * - listItem(address nft, uint256 tokenId, uint256 price) - Listar NFT
 * - buyItem(uint256 listingId) - Comprar NFT (requiere token approval previo)
 * - cancelListing(uint256 listingId) - Cancelar listing
 *
 * SUBASTAS:
 * - createAuction(address nft, uint256 tokenId, uint256 startPrice, uint256 duration)
 * - placeBid(uint256 auctionId, uint256 amount) - Hacer puja (requiere token approval)
 * - endAuction(uint256 auctionId) - Finalizar subasta (cualquiera puede llamar si termino el tiempo)
 *
 * SEGURIDAD:
 * - ReentrancyGuard para prevenir ataques de reentrancia
 * - Validar que el vendedor es dueño del NFT
 * - Validar que el NFT esta aprobado para el marketplace
 * - Validar tiempo de subasta
 * - Devolver tokens a pujas perdedoras
 */
contract NFTMarketplace {
    // TODO: Implementar

    // address public paymentToken; // ProjectToken address
    // uint256 public platformFeeBps; // Comision en basis points (250 = 2.5%)
}
