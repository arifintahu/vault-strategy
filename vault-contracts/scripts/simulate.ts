import { ethers } from "hardhat";
import type { VaultBTC, MockAave, OracleEMA, StrategyFactory, LeverageStrategy } from "../typechain-types";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

/**
 * Simulate complete leverage strategy workflow
 * 1. Deploy all contracts
 * 2. Create user vaults
 * 3. Deposit and supply to Aave
 * 4. Simulate market conditions and rebalancing
 */
async function main(): Promise<void> {
  console.log("🚀 Starting Vault Strategy Simulation\n");

  const [deployer, user1, user2, keeper] = await ethers.getSigners();
  console.log("👥 Accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("  User2:", user2.address);
  console.log("  Keeper:", keeper.address);
  console.log();

  // ========== DEPLOY CONTRACTS ==========
  console.log("📦 Deploying Contracts...");

  const VaultBTC = await ethers.getContractFactory("VaultBTC");
  const vbtc = await VaultBTC.deploy() as VaultBTC;
  await vbtc.waitForDeployment();
  console.log("  ✅ VaultBTC:", await vbtc.getAddress());

  const MockAave = await ethers.getContractFactory("MockAave");
  const aave = await MockAave.deploy(await vbtc.getAddress()) as MockAave;
  await aave.waitForDeployment();
  console.log("  ✅ MockAave:", await aave.getAddress());

  const Oracle = await ethers.getContractFactory("OracleEMA");
  const oracle = await Oracle.deploy(
    toInt(60000),  // price
    toInt(59000),  // ema20
    toInt(58000),  // ema50
    toInt(55000)   // ema200
  ) as OracleEMA;
  await oracle.waitForDeployment();
  console.log("  ✅ OracleEMA:", await oracle.getAddress());

  const Factory = await ethers.getContractFactory("StrategyFactory");
  const factory = await Factory.deploy(
    await vbtc.getAddress(),
    await aave.getAddress(),
    await oracle.getAddress()
  ) as StrategyFactory;
  await factory.waitForDeployment();
  console.log("  ✅ StrategyFactory:", await factory.getAddress());
  console.log();

  // ========== MINT TOKENS ==========
  console.log("💰 Minting vBTC to users...");
  await vbtc.mint(user1.address, toInt(10));
  console.log("  ✅ User1: 10 vBTC");
  await vbtc.mint(user2.address, toInt(5));
  console.log("  ✅ User2: 5 vBTC");
  console.log();

  // ========== CREATE VAULTS ==========
  console.log("🏦 Creating Vaults...");

  // User1: Medium risk vault
  let tx = await factory.connect(user1).createVault(1);
  let receipt = await tx.wait();
  const user1Vaults = await factory.getVaultsByOwner(user1.address);
  const vault1 = await ethers.getContractAt("LeverageStrategy", user1Vaults[0]) as LeverageStrategy;
  console.log("  ✅ User1 Vault (Medium Risk):", await vault1.getAddress());

  // User2: High risk vault
  tx = await factory.connect(user2).createVault(2);
  receipt = await tx.wait();
  const user2Vaults = await factory.getVaultsByOwner(user2.address);
  const vault2 = await ethers.getContractAt("LeverageStrategy", user2Vaults[0]) as LeverageStrategy;
  console.log("  ✅ User2 Vault (High Risk):", await vault2.getAddress());
  console.log();

  // ========== DEPOSIT TO VAULTS ==========
  console.log("📥 Depositing to Vaults...");

  // User1 deposits 8 vBTC
  await vbtc.connect(user1).approve(await vault1.getAddress(), toInt(8));
  await vault1.connect(user1).deposit(toInt(8));
  console.log("  ✅ User1 deposited 8 vBTC");

  // User2 deposits 4 vBTC
  await vbtc.connect(user2).approve(await vault2.getAddress(), toInt(4));
  await vault2.connect(user2).deposit(toInt(4));
  console.log("  ✅ User2 deposited 4 vBTC");
  console.log();

  // ========== SUPPLY TO AAVE ==========
  console.log("🏦 Supplying to Aave...");

  await vault1.supplyToAave(toInt(8));
  console.log("  ✅ User1 supplied 8 vBTC to Aave");

  await vault2.supplyToAave(toInt(4));
  console.log("  ✅ User2 supplied 4 vBTC to Aave");
  console.log();

  // ========== INITIAL STATE ==========
  console.log("📊 Initial State:");
  await printVaultState(vault1, "User1");
  await printVaultState(vault2, "User2");
  await printOracleState(oracle);
  console.log();

  // ========== SIMULATE BULLISH MARKET ==========
  console.log("📈 Simulating Bullish Market (Price rises to $65k)...");
  await oracle.setEMAs(
    toInt(65000),  // price rises
    toInt(63000),  // ema20
    toInt(61000),  // ema50
    toInt(58000)   // ema200
  );
  await printOracleState(oracle);

  console.log("  🔄 Rebalancing vaults...");
  await vault1.connect(keeper).rebalance();
  console.log("    ✅ User1 vault rebalanced");
  await vault2.connect(keeper).rebalance();
  console.log("    ✅ User2 vault rebalanced");
  console.log();

  await printVaultState(vault1, "User1");
  await printVaultState(vault2, "User2");
  console.log();

  // ========== SIMULATE CONTINUED BULLISH ==========
  console.log("📈 Continued Bullish (Price at $70k)...");
  await oracle.setEMAs(
    toInt(70000),
    toInt(68000),
    toInt(65000),
    toInt(62000)
  );
  await printOracleState(oracle);

  console.log("  🔄 Rebalancing vaults...");
  await vault1.connect(keeper).rebalance();
  await vault2.connect(keeper).rebalance();
  console.log();

  await printVaultState(vault1, "User1");
  await printVaultState(vault2, "User2");
  console.log();

  // ========== SIMULATE BEARISH MARKET ==========
  console.log("📉 Simulating Bearish Market (Price drops to $55k)...");
  await oracle.setEMAs(
    toInt(55000),  // price drops
    toInt(58000),  // ema20
    toInt(60000),  // ema50
    toInt(62000)   // ema200
  );
  await printOracleState(oracle);

  console.log("  🔄 Rebalancing vaults...");
  await vault1.connect(keeper).rebalance();
  console.log("    ✅ User1 vault rebalanced");
  await vault2.connect(keeper).rebalance();
  console.log("    ✅ User2 vault rebalanced");
  console.log();

  await printVaultState(vault1, "User1");
  await printVaultState(vault2, "User2");
  console.log();

  // ========== SIMULATE RECOVERY ==========
  console.log("📈 Market Recovery (Price back to $60k)...");
  await oracle.setEMAs(
    toInt(60000),
    toInt(59000),
    toInt(58000),
    toInt(57000)
  );
  await printOracleState(oracle);

  console.log("  🔄 Rebalancing vaults...");
  await vault1.connect(keeper).rebalance();
  await vault2.connect(keeper).rebalance();
  console.log();

  await printVaultState(vault1, "User1");
  await printVaultState(vault2, "User2");
  console.log();

  // ========== FINAL SUMMARY ==========
  console.log("📋 Final Summary:");
  console.log("  Total Vaults Created:", await factory.totalVaults());
  console.log("  User1 Vaults:", (await factory.getVaultsByOwner(user1.address)).length);
  console.log("  User2 Vaults:", (await factory.getVaultsByOwner(user2.address)).length);
  console.log();

  console.log("✅ Simulation Complete!");
}

async function printVaultState(vault: LeverageStrategy, label: string): Promise<void> {
  const state = await vault.getVaultState();
  const avgPrice = await vault.averageBtcPrice();

  console.log(`  ${label} Vault:`);
  console.log(`    Vault Balance: ${formatBTC(state._vaultBalance)} vBTC`);
  console.log(`    Supplied to Aave: ${formatBTC(state._suppliedToAave)} vBTC`);
  console.log(`    BTC Position: ${formatBTC(state._btcPosition)} vBTC`);
  console.log(`    Borrowed: $${formatUSD(state._borrowedFromAave)}`);
  console.log(`    Target Leverage: ${formatLeverage(state._targetLeverageBps)}`);
  console.log(`    Current Leverage: ${formatLeverage(state._currentLeverageBps)}`);
  console.log(`    Avg BTC Price: $${formatUSD(avgPrice)}`);
  console.log(`    Risk Tier: ${getRiskName(state._risk)}`);
}

async function printOracleState(oracle: OracleEMA): Promise<void> {
  const [price, ema20, ema50, ema200] = await oracle.get();
  const signal = await oracle.getSignal();

  console.log(`  Oracle State:`);
  console.log(`    Price: $${formatUSD(price)}`);
  console.log(`    EMA20: $${formatUSD(ema20)}`);
  console.log(`    EMA50: $${formatUSD(ema50)}`);
  console.log(`    EMA200: $${formatUSD(ema200)}`);
  console.log(`    Signal: ${getSignalName(signal)}`);
}

function formatBTC(value: bigint): string {
  return (Number(value) / 1e8).toFixed(4);
}

function formatUSD(value: bigint): string {
  return (Number(value) / 1e8).toFixed(2);
}

function formatLeverage(bps: bigint): string {
  return (Number(bps) / 10000).toFixed(2) + "x";
}

function getRiskName(risk: bigint): string {
  const risks = ["Low", "Medium", "High"];
  return risks[Number(risk)] || "Unknown";
}

function getSignalName(signal: bigint): string {
  const signals: { [key: string]: string } = {
    "2": "Strong Bullish 📈📈",
    "1": "Bullish 📈",
    "0": "Neutral ➡️",
    "-1": "Bearish 📉",
    "-2": "Strong Bearish 📉📉"
  };
  return signals[signal.toString()] || "Unknown";
}

main().catch((error: Error) => {
  console.error(error);
  process.exit(1);
});
