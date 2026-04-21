import { expect } from "chai";
import { ethers } from "hardhat";
import type { NFTCollection } from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("NFTCollection", function () {
  let nft: NFTCollection;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  const URI = "ipfs://QmTestHash/metadata.json";

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const NFTFactory = await ethers.getContractFactory("NFTCollection");
    nft = await NFTFactory.deploy(owner.address);
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct name, symbol and owner", async function () {
      expect(await nft.name()).to.equal("Croody NFT Collection");
      expect(await nft.symbol()).to.equal("CRN");
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Owner can mint an NFT and receive correct tokenId starting at 1", async function () {
      await nft.mintTo(addr1.address, URI);
      expect(await nft.ownerOf(1n)).to.equal(addr1.address);
      expect(await nft.balanceOf(addr1.address)).to.equal(1n);
    });

    it("tokenId increments correctly across multiple mints", async function () {
      await nft.mintTo(addr1.address, URI);
      await nft.mintTo(addr1.address, URI);
      expect(await nft.balanceOf(addr1.address)).to.equal(2n);
      expect(await nft.ownerOf(1n)).to.equal(addr1.address);
      expect(await nft.ownerOf(2n)).to.equal(addr1.address);
    });

    it("Should set correct tokenURI", async function () {
      await nft.mintTo(addr1.address, URI);
      expect(await nft.tokenURI(1n)).to.equal(URI);
    });

    it("Should emit NFTMinted event with correct args", async function () {
      await expect(nft.mintTo(addr1.address, URI))
        .to.emit(nft, "NFTMinted")
        .withArgs(addr1.address, 1n, URI);
    });

    it("Reverts with InvalidRecipient when minting to address(0)", async function () {
      await expect(
        nft.mintTo(ethers.ZeroAddress, URI),
      ).to.be.revertedWithCustomError(nft, "InvalidRecipient");
    });

    it("Reverts when non-owner calls mintTo", async function () {
      await expect(
        nft.connect(addr1).mintTo(addr1.address, URI),
      ).to.be.reverted;
    });

    it("Should support ERC721, ERC721Enumerable, and ERC165 interfaces", async function () {
      expect(await nft.supportsInterface("0x80ac58cd")).to.be.true; // ERC721
      expect(await nft.supportsInterface("0x780e9d63")).to.be.true; // ERC721Enumerable
      expect(await nft.supportsInterface("0x01ffc9a7")).to.be.true; // ERC165
    });
  });
});
