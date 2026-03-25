import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTCollection", function () {
  async function deployNFTFixture() {
    const [owner, userA, userB] = await ethers.getSigners();
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nft = await NFTCollection.deploy(owner.address);
    return { nft, owner, userA, userB };
  }

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      const { nft } = await deployNFTFixture();
      expect(await nft.name()).to.equal("Croody NFT Collection");
      expect(await nft.symbol()).to.equal("CRN");
    });

    it("Should set the correct owner", async function () {
      const { nft, owner } = await deployNFTFixture();
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint a new NFT and assign it to the recipient", async function () {
      const { nft, owner, userA } = await deployNFTFixture();
      await nft.connect(owner).mintTo(userA.address, "ipfs://metadata1");

      expect(await nft.balanceOf(userA.address)).to.equal(1);
      expect(await nft.ownerOf(1)).to.equal(userA.address);
    });

    it("Should set correct tokenURI", async function () {
      const { nft, owner, userA } = await deployNFTFixture();
      const uri = "ipfs://QmTest123";
      await nft.connect(owner).mintTo(userA.address, uri);

      expect(await nft.tokenURI(1)).to.equal(uri);
    });

    it("Should emit NFTMinted event", async function () {
      const { nft, owner, userA } = await deployNFTFixture();
      await expect(nft.connect(owner).mintTo(userA.address, "ipfs://meta"))
        .to.emit(nft, "NFTMinted")
        .withArgs(userA.address, 1, "ipfs://meta");
    });

    it("Should reject minting from non-owner", async function () {
      const { nft, userA, userB } = await deployNFTFixture();
      await expect(
        nft.connect(userA).mintTo(userB.address, "ipfs://hack")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should increment token IDs", async function () {
      const { nft, owner, userA, userB } = await deployNFTFixture();
      await nft.connect(owner).mintTo(userA.address, "ipfs://first");
      await nft.connect(owner).mintTo(userB.address, "ipfs://second");

      expect(await nft.ownerOf(1)).to.equal(userA.address);
      expect(await nft.ownerOf(2)).to.equal(userB.address);
    });
  });

  describe("Transfer", function () {
    it("Should transfer NFT between wallets using transferFrom", async function () {
      const { nft, owner, userA, userB } = await deployNFTFixture();
      await nft.connect(owner).mintTo(userA.address, "ipfs://transferTest");

      // userA approves and transfers to userB
      await nft.connect(userA).approve(userB.address, 1);
      await nft.connect(userB).transferFrom(userA.address, userB.address, 1);

      expect(await nft.ownerOf(1)).to.equal(userB.address);
      expect(await nft.balanceOf(userA.address)).to.equal(0);
      expect(await nft.balanceOf(userB.address)).to.equal(1);
    });

    it("Should transfer NFT using safeTransferFrom", async function () {
      const { nft, owner, userA, userB } = await deployNFTFixture();
      await nft.connect(owner).mintTo(userA.address, "ipfs://safeTransfer");

      // Owner of the NFT can transfer directly
      await nft.connect(userA)["safeTransferFrom(address,address,uint256)"](
        userA.address, userB.address, 1
      );

      expect(await nft.ownerOf(1)).to.equal(userB.address);
    });

    it("Should fail transfer if caller is not owner or approved", async function () {
      const { nft, owner, userA, userB } = await deployNFTFixture();
      await nft.connect(owner).mintTo(userA.address, "ipfs://noApproval");

      await expect(
        nft.connect(userB).transferFrom(userA.address, userB.address, 1)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });

    it("Should preserve tokenURI after transfer", async function () {
      const { nft, owner, userA, userB } = await deployNFTFixture();
      const uri = "ipfs://QmPersistentURI";
      await nft.connect(owner).mintTo(userA.address, uri);

      await nft.connect(userA)["safeTransferFrom(address,address,uint256)"](
        userA.address, userB.address, 1
      );

      expect(await nft.tokenURI(1)).to.equal(uri);
    });

    it("Should allow approved operator to transfer", async function () {
      const { nft, owner, userA, userB } = await deployNFTFixture();
      await nft.connect(owner).mintTo(userA.address, "ipfs://approvalTest");

      // userA approves userB as operator for all tokens
      await nft.connect(userA).setApprovalForAll(userB.address, true);
      await nft.connect(userB).transferFrom(userA.address, userB.address, 1);

      expect(await nft.ownerOf(1)).to.equal(userB.address);
    });

    it("Should emit Transfer event", async function () {
      const { nft, owner, userA, userB } = await deployNFTFixture();
      await nft.connect(owner).mintTo(userA.address, "ipfs://eventTest");

      await expect(
        nft.connect(userA)["safeTransferFrom(address,address,uint256)"](
          userA.address, userB.address, 1
        )
      ).to.emit(nft, "Transfer")
        .withArgs(userA.address, userB.address, 1);
    });
  });
});
