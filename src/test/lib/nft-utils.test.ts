import { describe, it, expect } from "vitest";
import { toGatewayURL, findMockByTokenId } from "@/lib/nft-utils";

describe("nft-utils.ts", () => {
  describe("toGatewayURL", () => {
    it("converts ipfs:// URI to https://ipfs.io/ipfs/ URL", () => {
      const result = toGatewayURL("ipfs://QmABC123");
      expect(result).to.equal("https://ipfs.io/ipfs/QmABC123");
    });

    it("passes through non-IPFS URLs unchanged", () => {
      const url = "https://example.com/img.png";
      expect(toGatewayURL(url)).to.equal(url);
    });

    it("passes through empty string", () => {
      expect(toGatewayURL("")).to.equal("");
    });

    it("handles ipfs:// with no hash", () => {
      const result = toGatewayURL("ipfs://");
      expect(result).to.equal("https://ipfs.io/ipfs/");
    });
  });

  describe("findMockByTokenId", () => {
    it("finds NFT by exact id", () => {
      const result = findMockByTokenId("001");
      expect(result).toBeDefined();
      if (result) {
        expect(result.id).to.equal("001");
      }
    });

    it("finds NFT by unpadded id", () => {
      const result = findMockByTokenId("1");
      expect(result).toBeDefined();
      if (result) {
        expect(result.id).to.equal("001");
      }
    });

    it("returns undefined for unknown id", () => {
      const result = findMockByTokenId("999");
      expect(result).toBeUndefined();
    });

    it("does not find with wrong padding strategy", () => {
      const result = findMockByTokenId("0001");
      expect(result).toBeUndefined();
    });
  });
});
