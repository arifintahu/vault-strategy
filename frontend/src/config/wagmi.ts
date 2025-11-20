import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define chain - configurable via environment variables
export const chain = defineChain({
  id: Number(import.meta.env.VITE_CHAIN_ID) || 31337,
  name: import.meta.env.VITE_CHAIN_NAME || 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: import.meta.env.VITE_CHAIN_CURRENCY_NAME || 'Ethereum',
    symbol: import.meta.env.VITE_CHAIN_CURRENCY_SYMBOL || 'ETH',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545'],
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: import.meta.env.VITE_APP_NAME || 'Vault Strategy',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'd419fa909b9a2764bfa119296674f667',
  chains: [chain],
  ssr: false,
});
