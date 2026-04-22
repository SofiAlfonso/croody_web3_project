import { describe, it, expect } from "vitest";
import {
  useMyNfts,
  useNftById,
  useLiveAuctions,
  useMyAuctions,
  useAuctionById,
} from "@/hooks/useMarketplaceData";

describe("useMarketplaceData (re-exports)", () => {
  it("exports useMyNfts", () => expect(useMyNfts).toBeTypeOf("function"));
  it("exports useNftById", () => expect(useNftById).toBeTypeOf("function"));
  it("exports useLiveAuctions", () => expect(useLiveAuctions).toBeTypeOf("function"));
  it("exports useMyAuctions", () => expect(useMyAuctions).toBeTypeOf("function"));
  it("exports useAuctionById", () => expect(useAuctionById).toBeTypeOf("function"));
});
