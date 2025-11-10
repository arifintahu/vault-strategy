import { ethers } from "hardhat";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy VaultBTC
  const VaultBTC = await ethers.getContractFactory("VaultBTC");
  const vbtc = await VaultBTC.deploy();
  await vbtc.waitForDeployment();
  const vbtcAddress = await vbtc.getAddress();
  console.log("VaultBTC:", vbtcAddress);

  // Deploy Oracle with initial bands
  // price=60k, ma=60k, upper=63k (+5%), lower=57k (-5%)
  const Oracle = await ethers.getContractFactory("OracleBands");
  const oracle = await Oracle.deploy(
    toInt(60000), 
    toInt(60000), 
    toInt(63000), 
    toInt(57000)
  );
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("OracleBands:", oracleAddress);

  // Deploy StrategyFactory
  const Factory = await ethers.getContractFactory("StrategyFactory");
  const factory = await Factory.deploy(vbtcAddress, oracleAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("StrategyFactory:", factoryAddress);

  // Mint some vBTC for the deployer for demo
  const mintAmt = 10n * 10n ** 8n; // 10 vBTC
  await (await vbtc.mint(deployer.address, mintAmt)).wait();
  console.log("Minted 10 vBTC to deployer");

  console.log("\n=== Deployment Summary ===");
  console.log("VaultBTC:", vbtcAddress);
  console.log("OracleBands:", oracleAddress);
  console.log("StrategyFactory:", factoryAddress);
  console.log("\nTo create a vault, call: factory.createVault(riskTier)");
  console.log("Risk tiers: 0=Low, 1=Medium, 2=High");
}

main().catch((error: Error) => {
  console.error(error);
  process.exit(1);
});
