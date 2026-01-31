/**
 * Tipos relacionados con el ProjectToken (ERC-20)
 */

export interface TokenBalance {
  value: bigint;
  formatted: string;
  symbol: string;
  decimals: number;
}

export interface TokenTransfer {
  from: `0x${string}`;
  to: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
  txHash: `0x${string}`;
}

export interface TokenAllowance {
  owner: `0x${string}`;
  spender: `0x${string}`;
  amount: bigint;
}
