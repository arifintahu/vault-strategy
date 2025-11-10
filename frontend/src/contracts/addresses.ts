// Contract addresses for local network
// Update these after deploying contracts

export const CONTRACTS = {
  VaultBTC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  MockAave: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  OracleEMA: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  StrategyFactory: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
} as const;

export const CHAIN_ID = 31337; // Hardhat local network
export const RPC_URL = 'http://127.0.0.1:8545';
