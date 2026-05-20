import { expect } from "chai";
import { ethers } from "hardhat";
import type { ProjectToken } from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ProjectToken", function () {
  let token: ProjectToken;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("ProjectToken");
    token = (await TokenFactory.deploy()) as unknown as ProjectToken;
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await token.name()).to.equal("Croody Token");
      expect(await token.symbol()).to.equal("CRD");
    });

    it("Should mint 1,000,000 CRD to the contract itself at deployment", async function () {
      const supply = ethers.parseUnits("1000000", 18);
      expect(await token.totalSupply()).to.equal(supply);
      expect(await token.balanceOf(await token.getAddress())).to.equal(supply);
      expect(await token.balanceOf(owner.address)).to.equal(0n);
    });
  });

  describe("distribute", function () {
    it("Owner can distribute tokens to a recipient", async function () {
      const amount = ethers.parseUnits("100", 18);
      const supply = ethers.parseUnits("1000000", 18);
      await token.distribute(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
      expect(await token.balanceOf(await token.getAddress())).to.equal(
        supply - amount,
      );
    });

    it("Reverts with InsufficientFunds when distributing more than contract balance", async function () {
      const tooMuch = ethers.parseUnits("1000001", 18);
      await expect(
        token.distribute(addr1.address, tooMuch),
      ).to.be.reverted;
    });

    it("Reverts when non-owner calls distribute", async function () {
      const amount = ethers.parseUnits("100", 18);
      await expect(
        token.connect(addr1).distribute(addr2.address, amount),
      ).to.be.reverted;
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseUnits("200", 18);
      const transferAmount = ethers.parseUnits("50", 18);
      await token.distribute(addr1.address, amount);
      await token.connect(addr1).transfer(addr2.address, transferAmount);
      expect(await token.balanceOf(addr1.address)).to.equal(
        amount - transferAmount,
      );
      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const amount = ethers.parseUnits("100", 18);
      await token.distribute(addr1.address, amount);
      await expect(
        token
          .connect(addr1)
          .transfer(addr2.address, ethers.parseUnits("200", 18)),
      ).to.be.reverted;
    });
  });

  describe("Allowances", function () {
    it("Should approve spender", async function () {
      const amount = ethers.parseUnits("500", 18);
      await token.distribute(addr1.address, ethers.parseUnits("1000", 18));
      await token.connect(addr1).approve(addr2.address, amount);
      expect(await token.allowance(addr1.address, addr2.address)).to.equal(
        amount,
      );
    });

    it("Should transferFrom after approval", async function () {
      const amount = ethers.parseUnits("1000", 18);
      const transferAmount = ethers.parseUnits("300", 18);
      await token.distribute(addr1.address, amount);
      await token
        .connect(addr1)
        .approve(addr2.address, transferAmount);
      await token
        .connect(addr2)
        .transferFrom(addr1.address, addr2.address, transferAmount);
      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await token.allowance(addr1.address, addr2.address)).to.equal(0n);
    });
  });
});
