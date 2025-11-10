import { ethers } from 'ethers';
import { CONTRACTS, RPC_URL } from '../contracts/addresses';

// Import ABIs
import VaultBTCABI from '../contracts/abis/VaultBTC.json';
import MockAaveABI from '../contracts/abis/MockAave.json';
import OracleEMAABI from '../contracts/abis/OracleEMA.json';
import LeverageStrategyABI from '../contracts/abis/LeverageStrategy.json';
import StrategyFactoryABI from '../contracts/abis/StrategyFactory.json';

export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

export const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
};

export const getVaultBTCContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.VaultBTC, VaultBTCABI.abi, signerOrProvider);
};

export const getMockAaveContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.MockAave, MockAaveABI.abi, signerOrProvider);
};

export const getOracleEMAContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.OracleEMA, OracleEMAABI.abi, signerOrProvider);
};

export const getStrategyFactoryContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.StrategyFactory, StrategyFactoryABI.abi, signerOrProvider);
};

export const getLeverageStrategyContract = (address: string, signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(address, LeverageStrategyABI.abi, signerOrProvider);
};

// Request account access
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
};

// Add MetaMask types
declare global {
  interface Window {
    ethereum?: any;
  }
}
