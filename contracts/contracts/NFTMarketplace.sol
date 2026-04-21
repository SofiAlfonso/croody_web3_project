// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NFTMarketplace
 * @dev Marketplace de subastas para NFTs usando ProjectToken (ERC-20) como moneda de pago
 */
contract NFTMarketplace is ReentrancyGuard {
    IERC20 public paymentToken;

    struct Auction {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool ended;
        bool cancelled;
    }

    struct AuctionView {
        uint256 auctionId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool ended;
        bool cancelled;
    }

    uint256 private _nextAuctionId = 1;
    mapping(uint256 => Auction) public auctions;

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 endTime
    );
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 amount);
    event AuctionCancelled(uint256 indexed auctionId);

    constructor(address _paymentToken) {
        require(_paymentToken != address(0), "Invalid token address");
        paymentToken = IERC20(_paymentToken);
    }

    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration
    ) external returns (uint256 auctionId) {
        require(startPrice > 0, "Price must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the NFT owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        // Transfer NFT to marketplace for escrow
        nft.transferFrom(msg.sender, address(this), tokenId);

        auctionId = _nextAuctionId;
        _nextAuctionId += 1;

        auctions[auctionId] = Auction({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            startPrice: startPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            ended: false,
            cancelled: false
        });

        emit AuctionCreated(auctionId, msg.sender, nftContract, tokenId, startPrice, block.timestamp + duration);
    }

    function placeBid(uint256 auctionId, uint256 amount) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.seller != address(0), "Auction does not exist");
        require(!auction.ended, "Auction already ended");
        require(!auction.cancelled, "Auction cancelled");
        require(block.timestamp < auction.endTime, "Auction expired");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(amount >= auction.startPrice, "Bid below start price");
        require(amount > auction.highestBid, "Bid not high enough");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            require(
                paymentToken.transfer(auction.highestBidder, auction.highestBid),
                "Refund failed"
            );
        }

        // Pull tokens from new bidder
        require(
            paymentToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        auction.highestBid = amount;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, amount);
    }

    function endAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.seller != address(0), "Auction does not exist");
        require(!auction.ended, "Auction already ended");
        require(!auction.cancelled, "Auction cancelled");
        require(block.timestamp >= auction.endTime, "Auction not yet expired");

        auction.ended = true;

        IERC721 nft = IERC721(auction.nftContract);

        if (auction.highestBidder != address(0)) {
            // Transfer NFT to winner
            nft.transferFrom(address(this), auction.highestBidder, auction.tokenId);
            // Transfer tokens to seller
            require(
                paymentToken.transfer(auction.seller, auction.highestBid),
                "Payment to seller failed"
            );
            emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
        } else {
            // No bids — return NFT to seller
            nft.transferFrom(address(this), auction.seller, auction.tokenId);
            emit AuctionEnded(auctionId, address(0), 0);
        }
    }

    function cancelAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.seller == msg.sender, "Not the seller");
        require(!auction.ended, "Auction already ended");
        require(!auction.cancelled, "Already cancelled");
        require(auction.highestBidder == address(0), "Cannot cancel with bids");

        auction.cancelled = true;

        // Return NFT to seller
        IERC721 nft = IERC721(auction.nftContract);
        nft.transferFrom(address(this), auction.seller, auction.tokenId);

        emit AuctionCancelled(auctionId);
    }

    function getAuction(uint256 auctionId) external view returns (
        address seller,
        address nftContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 highestBid,
        address highestBidder,
        uint256 endTime,
        bool ended,
        bool cancelled
    ) {
        Auction storage a = auctions[auctionId];
        return (
            a.seller, a.nftContract, a.tokenId,
            a.startPrice, a.highestBid, a.highestBidder,
            a.endTime, a.ended, a.cancelled
        );
    }

    function getLastAuctionId() external view returns (uint256) {
        return _nextAuctionId - 1;
    }

    function getAllActiveAuctions() external view returns (AuctionView[] memory) {
        uint256 lastAuctionId = _nextAuctionId - 1;
        uint256 activeCount = 0;

        for (uint256 i = 1; i <= lastAuctionId; i++) {
            Auction storage a = auctions[i];
            if (a.seller != address(0) && !a.ended && !a.cancelled && block.timestamp < a.endTime) {
                activeCount++;
            }
        }

        AuctionView[] memory activeAuctions = new AuctionView[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= lastAuctionId; i++) {
            Auction storage a = auctions[i];
            if (a.seller != address(0) && !a.ended && !a.cancelled && block.timestamp < a.endTime) {
                activeAuctions[index] = AuctionView({
                    auctionId: i,
                    seller: a.seller,
                    nftContract: a.nftContract,
                    tokenId: a.tokenId,
                    startPrice: a.startPrice,
                    highestBid: a.highestBid,
                    highestBidder: a.highestBidder,
                    endTime: a.endTime,
                    ended: a.ended,
                    cancelled: a.cancelled
                });
                index++;
            }
        }

        return activeAuctions;
    }
}
