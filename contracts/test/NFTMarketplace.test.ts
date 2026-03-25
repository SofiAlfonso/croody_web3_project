import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("NFTMarketplace", function () {
  const TOKEN_URI = "ipfs://QmTestNFT";
  const ONE_DAY = 86400; // seconds
  const START_PRICE = ethers.parseEther("100"); // 100 CRD
  const BID_AMOUNT = ethers.parseEther("150");
  const HIGHER_BID = ethers.parseEther("200");
  const DISTRIBUTE_AMOUNT = ethers.parseEther("1000");

  async function deployMarketplaceFixture() {
    const [owner, seller, bidderA, bidderB] = await ethers.getSigners();

    // Deploy ProjectToken
    const ProjectToken = await ethers.getContractFactory("ProjectToken");
    const token = await ProjectToken.deploy();

    // Deploy NFTCollection
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nft = await NFTCollection.deploy(owner.address);

    // Deploy NFTMarketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const marketplace = await NFTMarketplace.deploy(await token.getAddress());

    // Distribute tokens to bidders for testing
    await token.distribute(bidderA.address, DISTRIBUTE_AMOUNT);
    await token.distribute(bidderB.address, DISTRIBUTE_AMOUNT);

    // Mint an NFT to the seller
    await nft.mintTo(seller.address, TOKEN_URI);

    return { token, nft, marketplace, owner, seller, bidderA, bidderB };
  }

  describe("Deployment", function () {
    it("Should deploy with correct payment token", async function () {
      const { token, marketplace } = await deployMarketplaceFixture();
      expect(await marketplace.paymentToken()).to.equal(await token.getAddress());
    });
  });

  // ============================================
  // HU-12: Crear Subasta
  // ============================================
  describe("HU-12: Crear Subasta", function () {
    it("Should create an auction successfully", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      // Seller approves marketplace to transfer their NFT
      await nft.connect(seller).approve(mktAddr, 1);

      await expect(
        marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY)
      ).to.emit(marketplace, "AuctionCreated");

      // NFT should now be held by marketplace
      expect(await nft.ownerOf(1)).to.equal(mktAddr);
    });

    it("Should store auction details correctly", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      const auction = await marketplace.getAuction(1);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.nftContract).to.equal(nftAddr);
      expect(auction.tokenId).to.equal(1);
      expect(auction.startPrice).to.equal(START_PRICE);
      expect(auction.highestBid).to.equal(0);
      expect(auction.highestBidder).to.equal(ethers.ZeroAddress);
      expect(auction.ended).to.be.false;
      expect(auction.cancelled).to.be.false;
    });

    it("Should fail if caller is not the NFT owner", async function () {
      const { nft, marketplace, bidderA } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();

      await expect(
        marketplace.connect(bidderA).createAuction(nftAddr, 1, START_PRICE, ONE_DAY)
      ).to.be.revertedWith("Not the NFT owner");
    });

    it("Should fail if marketplace is not approved", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();

      // No approval given
      await expect(
        marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY)
      ).to.be.revertedWith("Marketplace not approved");
    });

    it("Should fail with zero price", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await expect(
        marketplace.connect(seller).createAuction(nftAddr, 1, 0, ONE_DAY)
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should fail with zero duration", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await expect(
        marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, 0)
      ).to.be.revertedWith("Duration must be greater than 0");
    });
  });

  // ============================================
  // HU-12 (cont): Placing Bids
  // ============================================
  describe("HU-12: Placing Bids", function () {
    it("Should accept a valid bid", async function () {
      const { nft, token, marketplace, seller, bidderA } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      // BidderA approves tokens and places bid
      await token.connect(bidderA).approve(mktAddr, BID_AMOUNT);
      await expect(
        marketplace.connect(bidderA).placeBid(1, BID_AMOUNT)
      ).to.emit(marketplace, "BidPlaced")
        .withArgs(1, bidderA.address, BID_AMOUNT);

      const auction = await marketplace.getAuction(1);
      expect(auction.highestBid).to.equal(BID_AMOUNT);
      expect(auction.highestBidder).to.equal(bidderA.address);
    });

    it("Should refund previous bidder when outbid", async function () {
      const { nft, token, marketplace, seller, bidderA, bidderB } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      // BidderA bids
      await token.connect(bidderA).approve(mktAddr, BID_AMOUNT);
      await marketplace.connect(bidderA).placeBid(1, BID_AMOUNT);

      const balanceAfterBid = await token.balanceOf(bidderA.address);

      // BidderB outbids
      await token.connect(bidderB).approve(mktAddr, HIGHER_BID);
      await marketplace.connect(bidderB).placeBid(1, HIGHER_BID);

      // BidderA should be refunded
      const balanceAfterRefund = await token.balanceOf(bidderA.address);
      expect(balanceAfterRefund).to.equal(balanceAfterBid + BID_AMOUNT);
    });

    it("Should fail if bid is below start price", async function () {
      const { nft, token, marketplace, seller, bidderA } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      const lowBid = ethers.parseEther("50");
      await token.connect(bidderA).approve(mktAddr, lowBid);
      await expect(
        marketplace.connect(bidderA).placeBid(1, lowBid)
      ).to.be.revertedWith("Bid below start price");
    });

    it("Should fail if bid is not higher than current highest", async function () {
      const { nft, token, marketplace, seller, bidderA, bidderB } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await token.connect(bidderA).approve(mktAddr, BID_AMOUNT);
      await marketplace.connect(bidderA).placeBid(1, BID_AMOUNT);

      // BidderB tries to bid the same amount
      await token.connect(bidderB).approve(mktAddr, BID_AMOUNT);
      await expect(
        marketplace.connect(bidderB).placeBid(1, BID_AMOUNT)
      ).to.be.revertedWith("Bid not high enough");
    });

    it("Should fail if seller tries to bid on own auction", async function () {
      const { nft, token, marketplace, seller, owner } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await token.distribute(seller.address, DISTRIBUTE_AMOUNT);
      await token.connect(seller).approve(mktAddr, BID_AMOUNT);
      await expect(
        marketplace.connect(seller).placeBid(1, BID_AMOUNT)
      ).to.be.revertedWith("Seller cannot bid");
    });

    it("Should fail if auction has expired", async function () {
      const { nft, token, marketplace, seller, bidderA } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      // Fast-forward time past auction end
      await time.increase(ONE_DAY + 1);

      await token.connect(bidderA).approve(mktAddr, BID_AMOUNT);
      await expect(
        marketplace.connect(bidderA).placeBid(1, BID_AMOUNT)
      ).to.be.revertedWith("Auction expired");
    });
  });

  // ============================================
  // HU-13: Cancelar Subasta
  // ============================================
  describe("HU-13: Cancelar Subasta", function () {
    it("Should cancel auction with no bids and return NFT", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await expect(
        marketplace.connect(seller).cancelAuction(1)
      ).to.emit(marketplace, "AuctionCancelled").withArgs(1);

      // NFT returned to seller
      expect(await nft.ownerOf(1)).to.equal(seller.address);

      const auction = await marketplace.getAuction(1);
      expect(auction.cancelled).to.be.true;
    });

    it("Should fail to cancel if there are bids", async function () {
      const { nft, token, marketplace, seller, bidderA } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await token.connect(bidderA).approve(mktAddr, BID_AMOUNT);
      await marketplace.connect(bidderA).placeBid(1, BID_AMOUNT);

      await expect(
        marketplace.connect(seller).cancelAuction(1)
      ).to.be.revertedWith("Cannot cancel with bids");
    });

    it("Should fail if non-seller tries to cancel", async function () {
      const { nft, marketplace, seller, bidderA } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await expect(
        marketplace.connect(bidderA).cancelAuction(1)
      ).to.be.revertedWith("Not the seller");
    });

    it("Should fail to cancel an already ended auction", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await time.increase(ONE_DAY + 1);
      await marketplace.endAuction(1);

      await expect(
        marketplace.connect(seller).cancelAuction(1)
      ).to.be.revertedWith("Auction already ended");
    });
  });

  // ============================================
  // HU-17: Cierre Automático de Subastas
  // ============================================
  describe("HU-17: Cierre Automático de Subastas", function () {
    it("Should end auction and transfer NFT to highest bidder", async function () {
      const { nft, token, marketplace, seller, bidderA } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await token.connect(bidderA).approve(mktAddr, BID_AMOUNT);
      await marketplace.connect(bidderA).placeBid(1, BID_AMOUNT);

      const sellerBalanceBefore = await token.balanceOf(seller.address);

      // Fast-forward past auction end
      await time.increase(ONE_DAY + 1);

      await expect(marketplace.endAuction(1))
        .to.emit(marketplace, "AuctionEnded")
        .withArgs(1, bidderA.address, BID_AMOUNT);

      // NFT goes to winner
      expect(await nft.ownerOf(1)).to.equal(bidderA.address);

      // Seller receives payment
      const sellerBalanceAfter = await token.balanceOf(seller.address);
      expect(sellerBalanceAfter).to.equal(sellerBalanceBefore + BID_AMOUNT);
    });

    it("Should return NFT to seller if no bids", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await time.increase(ONE_DAY + 1);
      await marketplace.endAuction(1);

      // NFT returned to seller
      expect(await nft.ownerOf(1)).to.equal(seller.address);
    });

    it("Should fail to end auction before time expires", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await expect(
        marketplace.endAuction(1)
      ).to.be.revertedWith("Auction not yet expired");
    });

    it("Should fail to end an already ended auction", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await time.increase(ONE_DAY + 1);
      await marketplace.endAuction(1);

      await expect(
        marketplace.endAuction(1)
      ).to.be.revertedWith("Auction already ended");
    });

    it("Anyone can call endAuction after time expires", async function () {
      const { nft, token, marketplace, seller, bidderA, bidderB } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await token.connect(bidderA).approve(mktAddr, BID_AMOUNT);
      await marketplace.connect(bidderA).placeBid(1, BID_AMOUNT);

      await time.increase(ONE_DAY + 1);

      // bidderB (a third party) ends the auction
      await marketplace.connect(bidderB).endAuction(1);

      expect(await nft.ownerOf(1)).to.equal(bidderA.address);
    });
  });

  // ============================================
  // HU-14: Ver Detalle de Subasta
  // ============================================
  describe("HU-14: Ver Detalle de Subasta", function () {
    it("Should return full auction details via getAuction", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      const auction = await marketplace.getAuction(1);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.nftContract).to.equal(nftAddr);
      expect(auction.tokenId).to.equal(1);
      expect(auction.startPrice).to.equal(START_PRICE);
      expect(auction.highestBid).to.equal(0);
      expect(auction.highestBidder).to.equal(ethers.ZeroAddress);
      expect(auction.ended).to.be.false;
      expect(auction.cancelled).to.be.false;
    });

    it("Should reflect updated state after bids", async function () {
      const { nft, token, marketplace, seller, bidderA } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await token.connect(bidderA).approve(mktAddr, BID_AMOUNT);
      await marketplace.connect(bidderA).placeBid(1, BID_AMOUNT);

      const auction = await marketplace.getAuction(1);
      expect(auction.highestBid).to.equal(BID_AMOUNT);
      expect(auction.highestBidder).to.equal(bidderA.address);
    });

    it("Should show ended status after auction ends", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await time.increase(ONE_DAY + 1);
      await marketplace.endAuction(1);

      const auction = await marketplace.getAuction(1);
      expect(auction.ended).to.be.true;
    });

    it("Should show cancelled status after cancellation", async function () {
      const { nft, marketplace, seller } = await deployMarketplaceFixture();
      const nftAddr = await nft.getAddress();
      const mktAddr = await marketplace.getAddress();

      await nft.connect(seller).approve(mktAddr, 1);
      await marketplace.connect(seller).createAuction(nftAddr, 1, START_PRICE, ONE_DAY);

      await marketplace.connect(seller).cancelAuction(1);

      const auction = await marketplace.getAuction(1);
      expect(auction.cancelled).to.be.true;
    });
  });
});
