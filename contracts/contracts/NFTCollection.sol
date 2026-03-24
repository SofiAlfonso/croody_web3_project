// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTCollection
 * @dev Contrato ERC-721 para crear y gestionar NFTs
 *
 * TODO: Implementar las siguientes funcionalidades:
 * - Heredar de ERC721URIStorage de OpenZeppelin
 * - Funcion mint para crear nuevos NFTs
 * - Control de acceso para minting
 */
contract NFTCollection is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(address initialOwner) ERC721("Croody NFT Collection", "CRN") {
        transferOwnership(initialOwner);
    }

    function mintTo(address to, string calldata metadataURI) external onlyOwner returns (uint256 tokenId) {
        require(to != address(0), "Invalid recipient");

        tokenId = _nextTokenId;
        _nextTokenId += 1;

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

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
