export type GlobalRewards = {
  launched: boolean;
  token: string | null;
  symbol: string;
  name: string;
  buyUrl: string;
  chainId: number;
  chainName: string;
  totalUsdcDistributed: number;
  totalUsdcWithdrawn: number;
  rewardSymbol: string;
  tokenDecimals: number;
  rewardDecimals: number;
  at: number;
  source: "chain" | "cache" | "prelaunch";
  error?: string;
};

export type WalletRewards = {
  launched: boolean;
  token: string | null;
  address: string;
  symbol: string;
  buyUrl: string;
  chainId: number;
  amgRaw: string;
  amgHeld: number;
  earnedUsdc: number;
  claimedUsdc: number;
  claimableUsdc: number;
  rewardSymbol: string;
  at: number;
  source: "chain" | "cache" | "prelaunch";
  error?: string;
};
