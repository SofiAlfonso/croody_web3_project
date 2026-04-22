import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules", "contracts"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/contracts.ts",
        "src/lib/nft-utils.ts",
        "src/lib/balance-utils.ts",
        "src/hooks/useNfts.ts",
        "src/hooks/useAuctions.ts",
        "src/hooks/useCreateAuction.ts",
        "src/hooks/useEndAuction.ts",
        "src/hooks/useCancelAuction.ts",
        "src/hooks/usePlaceBid.ts",
        "src/hooks/useSendTokens.ts",
        "src/hooks/useTransferNft.ts",
        "src/hooks/useWalletBalance.ts",
        "src/context/WalletContext.tsx",
        "src/components/send/SendTokens.tsx",
        "src/components/home/HomeClient.tsx",
        "src/components/dashboard/Dashboard.tsx",
        "src/components/nfts/NftGallery.tsx",
        "src/components/nfts/NftDetail.tsx",
        "src/components/auction/AuctionDetail.tsx",
        "src/components/shared/ActionModal.tsx",
        "src/components/shared/NotFoundState.tsx",
        "src/components/shared/WalletBadge.tsx",
        "src/components/shared/AppHeader.tsx",
        "src/components/shared/BackToDashboardLink.tsx",
        "src/hooks/useWallet.ts",
        "src/hooks/useMarketplaceData.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
