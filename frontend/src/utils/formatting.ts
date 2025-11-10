// Formatting utilities for displaying blockchain data

export const formatBTC = (value: bigint): string => {
  return (Number(value) / 1e8).toFixed(4);
};

export const formatUSD = (value: bigint): string => {
  return (Number(value) / 1e8).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatLeverage = (bps: bigint): string => {
  return (Number(bps) / 10000).toFixed(2) + 'x';
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatPercentage = (value: number): string => {
  return value.toFixed(2) + '%';
};

export const toInt = (n: number): bigint => {
  return BigInt(Math.floor(n * 1e8));
};

export const fromInt = (value: bigint): number => {
  return Number(value) / 1e8;
};
