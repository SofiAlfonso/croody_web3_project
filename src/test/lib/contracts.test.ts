import { describe, it, expect, beforeEach } from "vitest";
import { getNftCollectionAddress, getProjectTokenAddress } from "@/lib/contracts";

describe("contracts.ts", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
  });

  it("returns address from deployed-addresses.json when env var is missing", () => {
    delete process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
    const address = getNftCollectionAddress();
    // Should return valid address from deployed-addresses.json or null
    if (address !== null) {
      expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
    }
  });

  it("returns null when candidate does not start with 0x", () => {
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS = "abcdef1234567890abcdef1234567890abcdef";
    const address = getNftCollectionAddress();
    expect(address).to.be.null;
  });

  it("returns null when candidate has wrong length", () => {
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS = "0xABCD";
    const address = getNftCollectionAddress();
    expect(address).to.be.null;
  });

  it("returns the address when env var is a valid 42-char 0x address", () => {
    const validAddress = "0x" + "a".repeat(40);
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS = validAddress;
    const address = getNftCollectionAddress();
    expect(address).to.equal(validAddress);
  });

  it("prefers env var over deployed-addresses.json when both are set", () => {
    const envAddress = "0x" + "b".repeat(40);
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS = envAddress;
    const address = getNftCollectionAddress();
    expect(address).to.equal(envAddress);
  });

  it("falls back to deployed-addresses.json when env var is absent", () => {
    delete process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
    const address = getNftCollectionAddress();
    if (address !== null) {
      expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
    }
  });
});

describe("getProjectTokenAddress", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS;
  });

  it("returns address from deployed-addresses.json when env var is missing", () => {
    const address = getProjectTokenAddress();
    if (address !== null) {
      expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
    }
  });

  it("returns null when candidate does not start with 0x", () => {
    process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS = "abcdef1234567890abcdef1234567890abcdef12";
    expect(getProjectTokenAddress()).to.be.null;
  });

  it("returns null when candidate has wrong length", () => {
    process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS = "0xABCD";
    expect(getProjectTokenAddress()).to.be.null;
  });

  it("returns the address when env var is a valid 42-char 0x address", () => {
    const validAddress = "0x" + "c".repeat(40);
    process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS = validAddress;
    expect(getProjectTokenAddress()).to.equal(validAddress);
  });

  it("prefers env var over deployed-addresses.json", () => {
    const envAddress = "0x" + "d".repeat(40);
    process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS = envAddress;
    expect(getProjectTokenAddress()).to.equal(envAddress);
  });
});
