import { expect } from "chai";
import { ethers } from "hardhat";
import type { NFTCollection } from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("NFTCollection", function () {
  let nft: NFTCollection;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  const URI = "ipfs://QmTestHash/metadata.json";

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const NFTFactory = await ethers.getContractFactory("NFTCollection");
    nft = (await NFTFactory.deploy(owner.address)) as unknown as NFTCollection;
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
      expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true); // ERC721
      expect(await nft.supportsInterface("0x780e9d63")).to.equal(true); // ERC721Enumerable
      expect(await nft.supportsInterface("0x01ffc9a7")).to.equal(true); // ERC165
    });
  });

  describe("Transfer", function () {
    it("Should transfer NFT between wallets using transferFrom", async function () {
      await nft.mintTo(addr1.address, URI);
      await nft.connect(addr1).approve(addr2.address, 1n);
      await nft.connect(addr2).transferFrom(addr1.address, addr2.address, 1n);
      expect(await nft.ownerOf(1n)).to.equal(addr2.address);
      expect(await nft.balanceOf(addr1.address)).to.equal(0n);
      expect(await nft.balanceOf(addr2.address)).to.equal(1n);
    });

    it("Should transfer NFT using safeTransferFrom", async function () {
      await nft.mintTo(addr1.address, URI);
      await nft.connect(addr1)["safeTransferFrom(address,address,uint256)"](
        addr1.address, addr2.address, 1n,
      );
      expect(await nft.ownerOf(1n)).to.equal(addr2.address);
    });

    it("Should fail transfer if caller is not owner or approved", async function () {
      await nft.mintTo(addr1.address, URI);
      await expect(
        nft.connect(addr2).transferFrom(addr1.address, addr2.address, 1n),
      ).to.be.reverted;
    });

    it("Should preserve tokenURI after transfer", async function () {
      await nft.mintTo(addr1.address, URI);
      await nft.connect(addr1)["safeTransferFrom(address,address,uint256)"](
        addr1.address, addr2.address, 1n,
      );
      expect(await nft.tokenURI(1n)).to.equal(URI);
    });

    it("Should allow approved operator to transfer", async function () {
      await nft.mintTo(addr1.address, URI);
      await nft.connect(addr1).setApprovalForAll(addr2.address, true);
      await nft.connect(addr2).transferFrom(addr1.address, addr2.address, 1n);
      expect(await nft.ownerOf(1n)).to.equal(addr2.address);
    });

    it("Should emit Transfer event on safeTransferFrom", async function () {
      await nft.mintTo(addr1.address, URI);
      await expect(
        nft.connect(addr1)["safeTransferFrom(address,address,uint256)"](
          addr1.address, addr2.address, 1n,
        ),
      ).to.emit(nft, "Transfer").withArgs(addr1.address, addr2.address, 1n);
    });
  });
});
