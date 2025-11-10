export interface VaultState {
  vaultBalance: bigint;
  suppliedToAave: bigint;
  borrowedFromAave: bigint;
  btcPosition: bigint;
  targetLeverageBps: bigint;
  currentLeverageBps: bigint;
  avgBtcPrice: bigint;
  risk: number;
}

export interface OracleData {
  price: bigint;
  ema20: bigint;
  ema50: bigint;
  ema200: bigint;
  signal: number;
  isBullish: boolean;
  isBearish: boolean;
}

export interface UserVault {
  address: string;
  owner: string;
  state: VaultState;
}

export const RiskTier = {
  Low: 0,
  Medium: 1,
  High: 2,
} as const;

export type RiskTierType = typeof RiskTier[keyof typeof RiskTier];

export const RISK_TIER_NAMES: Record<number, string> = {
  [RiskTier.Low]: 'Low (1.1x max)',
  [RiskTier.Medium]: 'Medium (1.3x max)',
  [RiskTier.High]: 'High (1.5x max)',
};

export const SIGNAL_NAMES: Record<number, string> = {
  2: 'Strong Bullish 📈📈',
  1: 'Bullish 📈',
  0: 'Neutral ➡️',
  [-1]: 'Bearish 📉',
  [-2]: 'Strong Bearish 📉📉',
};
