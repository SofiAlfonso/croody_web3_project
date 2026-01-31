import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProjectToken", function () {
  // TODO: Implementar tests

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      // TODO: Test de deployment
    });

    it("Should assign initial supply to deployer", async function () {
      // TODO: Test de supply inicial
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      // TODO: Test de transfer P2P
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      // TODO: Test de balance insuficiente
    });
  });

  describe("Allowances", function () {
    it("Should approve spender", async function () {
      // TODO: Test de approve
    });

    it("Should transferFrom after approval", async function () {
      // TODO: Test de transferFrom
    });
  });
});
