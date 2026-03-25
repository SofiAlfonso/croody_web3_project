// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTCollection
 * @author Croody Team
 * @notice Contrato ERC-721 para crear y gestionar NFTs del ecosistema Croody
 */
contract NFTCollection is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    error InvalidRecipient();

    /// @notice Emitido cuando un nuevo NFT es minteado
    /// @param to Dirección del receptor
    /// @param tokenId ID del token minteado
    /// @param tokenURI URI de los metadatos del token
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(address initialOwner) ERC721("Croody NFT Collection", "CRN") {
        transferOwnership(initialOwner);
    }

    /// @notice Mintea un nuevo NFT y lo asigna a una dirección
    /// @param to Dirección del receptor
    /// @param metadataURI URI de los metadatos del NFT
    /// @return tokenId ID del token minteado
    function mintTo(address to, string calldata metadataURI) external onlyOwner returns (uint256 tokenId) {
        if (to == address(0)) revert InvalidRecipient();

        tokenId = _nextTokenId;
        ++_nextTokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit NFTMinted(to, tokenId, metadataURI);
    }

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @notice Retorna la URI de metadatos de un token
    /// @param tokenId ID del token
    /// @return URI de los metadatos
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /// @notice Verifica si el contrato soporta una interfaz
    /// @param interfaceId ID de la interfaz
    /// @return true si la interfaz es soportada
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
