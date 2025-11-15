import { ethers } from 'ethers';
import { CONTRACTS, RPC_URL } from '../contracts/addresses';
import type { WalletClient } from 'viem';
import { BrowserProvider } from 'ethers';

// Import ABIs
import VaultBTCABI from '../contracts/abis/VaultBTC.json';
import MockAaveABI from '../contracts/abis/MockAave.json';
import OracleEMAABI from '../contracts/abis/OracleEMA.json';
import LeverageStrategyABI from '../contracts/abis/LeverageStrategy.json';
import StrategyFactoryABI from '../contracts/abis/StrategyFactory.json';

export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

// Convert wagmi WalletClient to ethers Signer
export async function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  
  if (!account || !chain) {
    throw new Error('Wallet not connected');
  }
  
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = await provider.getSigner(account.address);
  return signer;
}

export const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error('Wallet not installed');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
};

export const getVaultBTCContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.VaultBTC, VaultBTCABI, signerOrProvider);
};

export const getMockAaveContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.MockAave, MockAaveABI, signerOrProvider);
};

export const getOracleEMAContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.OracleEMA, OracleEMAABI, signerOrProvider);
};

export const getStrategyFactoryContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.StrategyFactory, StrategyFactoryABI, signerOrProvider);
};

export const getLeverageStrategyContract = (address: string, signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(address, LeverageStrategyABI, signerOrProvider);
};

// Add wallet types
declare global {
  interface Window {
    ethereum?: any;
  }
}
