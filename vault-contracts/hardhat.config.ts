import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { 
      optimizer: { enabled: true, runs: 200 } 
    }
  },
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [process.env.EVM_PRIVATE_KEY as string],
      gasMultiplier: 1.2,
    }
  },
  mocha: { 
    timeout: 60000 
  }
};

export default config;
