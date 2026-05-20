import { createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { ACTIVE_CHAIN } from "./chain";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";

export const wagmiConfig = createConfig({
  chains: [ACTIVE_CHAIN],
  connectors: [injected()],
  transports: {
    [hardhat.id]: http(rpcUrl),
    [sepolia.id]: http(rpcUrl),
  },
});
