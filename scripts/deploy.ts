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

  // Deploy MockAave
  const MockAave = await ethers.getContractFactory("MockAave");
  const aave = await MockAave.deploy(vbtcAddress);
  await aave.waitForDeployment();
  const aaveAddress = await aave.getAddress();
  console.log("MockAave:", aaveAddress);

  // Deploy Oracle with initial EMAs
  // price=60k, ema20=59k, ema50=58k, ema200=55k (bullish setup)
  const Oracle = await ethers.getContractFactory("OracleEMA");
  const oracle = await Oracle.deploy(
    toInt(60000),  // current price
    toInt(59000),  // 20-day EMA
    toInt(58000),  // 50-day EMA
    toInt(55000)   // 200-day EMA
  );
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("OracleEMA:", oracleAddress);

  // Deploy StrategyFactory
  const Factory = await ethers.getContractFactory("StrategyFactory");
  const factory = await Factory.deploy(vbtcAddress, aaveAddress, oracleAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("StrategyFactory:", factoryAddress);

  // Mint some vBTC for the deployer for demo
  const mintAmt = 10n * 10n ** 8n; // 10 vBTC
  await (await vbtc.mint(deployer.address, mintAmt)).wait();
  console.log("Minted 10 vBTC to deployer");

  console.log("\n=== Deployment Summary ===");
  console.log("VaultBTC:", vbtcAddress);
  console.log("MockAave:", aaveAddress);
  console.log("OracleEMA:", oracleAddress);
  console.log("StrategyFactory:", factoryAddress);
  console.log("\nTo create a vault, call: factory.createVault(riskTier)");
  console.log("Risk tiers: 0=Low, 1=Medium, 2=High");
}

main().catch((error: Error) => {
  console.error(error);
  process.exit(1);
});
