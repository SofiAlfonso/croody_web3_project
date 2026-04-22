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
        "src/hooks/useSendTokens.ts",
        "src/hooks/useTransferNft.ts",
        "src/hooks/useWalletBalance.ts",
        "src/context/WalletContext.tsx",
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
