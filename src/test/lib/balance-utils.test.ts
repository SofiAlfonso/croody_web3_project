import { describe, it, expect } from "vitest";
import { formatBalance } from "@/lib/balance-utils";

describe("formatBalance", () => {
  it("formats an integer value", () => {
    expect(formatBalance("1000")).to.equal("1,000");
  });

  it("formats a decimal value with up to 4 decimals", () => {
    const result = formatBalance("1234.5678");
    expect(result).to.include("1");
  });

  it("returns '0' for non-finite values", () => {
    expect(formatBalance("abc")).to.equal("0");
    expect(formatBalance("Infinity")).to.equal("0");
  });

  it("formats zero correctly", () => {
    expect(formatBalance("0")).to.equal("0");
  });
});
