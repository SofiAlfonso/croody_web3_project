import { hardhat, sepolia } from "wagmi/chains";

export const ACTIVE_CHAIN =
  process.env.NEXT_PUBLIC_NETWORK === "sepolia" ? sepolia : hardhat;
