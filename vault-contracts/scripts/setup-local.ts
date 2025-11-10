import { ethers } from "hardhat";

/**
 * Complete local setup script:
 * 1. Deploy all contracts
 * 2. Initialize oracle with price data
 * 3. Mint vBTC to deployer
 * 4. Display all addresses and status
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Setting up local environment...\n");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy contracts
  console.log("📦 Deploying contracts...");
  
  const VaultBTC = await ethers.getContractFactory("VaultBTC");
  const vaultBTC = await VaultBTC.deploy();
  await vaultBTC.waitForDeployment();
  const vaultBTCAddress = await vaultBTC.getAddress();
  console.log("  ✅ VaultBTC:", vaultBTCAddress);

  const MockAave = await ethers.getContractFactory("MockAave");
  const mockAave = await MockAave.deploy();
  await mockAave.waitForDeployment();
  const mockAaveAddress = await mockAave.getAddress();
  console.log("  ✅ MockAave:", mockAaveAddress);

  // Deploy oracle with initial values
  const price = 5000000000000;    // $50,000
  const ema20 = 4950000000000;    // $49,500
  const ema50 = 4900000000000;    // $49,000
  const ema200 = 4800000000000;   // $48,000
  
  const OracleEMA = await ethers.getContractFactory("OracleEMA");
  const oracleEMA = await OracleEMA.deploy(price, ema20, ema50, ema200);
  await oracleEMA.waitForDeployment();
  const oracleEMAAddress = await oracleEMA.getAddress();
  console.log("  ✅ OracleEMA:", oracleEMAAddress);

  const StrategyFactory = await ethers.getContractFactory("StrategyFactory");
  const strategyFactory = await StrategyFactory.deploy(
    vaultBTCAddress,
    mockAaveAddress,
    oracleEMAAddress
  );
  await strategyFactory.waitForDeployment();
  const strategyFactoryAddress = await strategyFactory.getAddress();
  console.log("  ✅ StrategyFactory:", strategyFactoryAddress);

  // 2. Mint vBTC to deployer
  console.log("\n💰 Minting vBTC...");
  const mintAmount = ethers.parseUnits("10", 8);
  await vaultBTC.mint(deployer.address, mintAmount);
  console.log("  ✅ Minted 10 vBTC to deployer");

  // 3. Verify oracle data
  console.log("\n📊 Oracle Status:");
  const [priceRead, ema20Read, ema50Read, ema200Read] = await oracleEMA.get();
  const signal = await oracleEMA.getSignal();
  const isBullish = await oracleEMA.isBullish();
  
  console.log("  Price: $" + (Number(priceRead) / 1e8).toLocaleString());
  console.log("  EMA20: $" + (Number(ema20Read) / 1e8).toLocaleString());
  console.log("  EMA50: $" + (Number(ema50Read) / 1e8).toLocaleString());
  console.log("  EMA200: $" + (Number(ema200Read) / 1e8).toLocaleString());
  console.log("  Signal:", signal, isBullish ? "(Bullish 📈)" : "(Bearish/Neutral)");

  // 4. Display summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ LOCAL ENVIRONMENT READY!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("  VaultBTC:", vaultBTCAddress);
  console.log("  MockAave:", mockAaveAddress);
  console.log("  OracleEMA:", oracleEMAAddress);
  console.log("  StrategyFactory:", strategyFactoryAddress);
  
  console.log("\n📝 Update frontend/src/contracts/addresses.ts with these addresses");
  console.log("\n🎯 Next steps:");
  console.log("  1. Update contract addresses in frontend");
  console.log("  2. Start frontend: cd frontend && npm run dev");
  console.log("  3. Connect wallet and create vaults!");
  console.log("\n💡 To create a vault:");
  console.log("  factory.createVault(riskTier)");
  console.log("  Risk tiers: 0=Low, 1=Medium, 2=High\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
