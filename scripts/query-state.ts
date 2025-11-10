import { ethers } from "hardhat";
import type { VaultBTC, MockAave, OracleEMA, StrategyFactory, LeverageStrategy } from "../typechain-types";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

/**
 * Query all contract states
 * Usage: npx hardhat run scripts/query-state.ts --network localhost
 */
async function main(): Promise<void> {
  console.log("🔍 Querying Contract States\n");

  // Get contract addresses from deployment or environment
  // For demo, we'll deploy fresh contracts
  const [deployer, user1, user2] = await ethers.getSigners();

  console.log("📋 Accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("  User2:", user2.address);
  console.log();

  // Deploy contracts (in production, use existing addresses)
  console.log("📦 Deploying contracts for demo...");
  const vbtc = await (await ethers.getContractFactory("VaultBTC")).deploy() as VaultBTC;
  await vbtc.waitForDeployment();

  const aave = await (await ethers.getContractFactory("MockAave")).deploy(await vbtc.getAddress()) as MockAave;
  await aave.waitForDeployment();

  const oracle = await (await ethers.getContractFactory("OracleEMA")).deploy(
    toInt(60000), toInt(59000), toInt(58000), toInt(55000)
  ) as OracleEMA;
  await oracle.waitForDeployment();

  const factory = await (await ethers.getContractFactory("StrategyFactory")).deploy(
    await vbtc.getAddress(),
    await aave.getAddress(),
    await oracle.getAddress()
  ) as StrategyFactory;
  await factory.waitForDeployment();

  // Setup some data
  await vbtc.mint(user1.address, toInt(10));
  await factory.connect(user1).createVault(1);
  const vaults = await factory.getVaultsByOwner(user1.address);
  const vault = await ethers.getContractAt("LeverageStrategy", vaults[0]) as LeverageStrategy;
  await vbtc.connect(user1).approve(await vault.getAddress(), toInt(5));
  await vault.connect(user1).deposit(toInt(5));
  await vault.supplyToAave(toInt(5));

  console.log("✅ Setup complete\n");

  // ========== QUERY ALL STATES ==========
  console.log("═══════════════════════════════════════════════════════");
  console.log("📊 CONTRACT STATES");
  console.log("═══════════════════════════════════════════════════════\n");

  // VaultBTC State
  await queryVaultBTCState(vbtc, [deployer.address, user1.address, user2.address]);

  // Oracle State
  await queryOracleState(oracle);

  // MockAave State
  await queryAaveState(aave, [user1.address, user2.address]);

  // Factory State
  await queryFactoryState(factory, [user1.address, user2.address]);

  // Vault State
  await queryVaultState(vault, user1.address);

  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ Query Complete");
  console.log("═══════════════════════════════════════════════════════");
}

async function queryVaultBTCState(vbtc: VaultBTC, addresses: string[]): Promise<void> {
  console.log("🪙 VaultBTC State");
  console.log("─────────────────────────────────────────────────────");
  console.log("  Address:", await vbtc.getAddress());
  console.log("  Name:", await vbtc.name());
  console.log("  Symbol:", await vbtc.symbol());
  console.log("  Decimals:", await vbtc.decimals());
  console.log("  Total Supply:", formatBTC(await vbtc.totalSupply()), "vBTC");
  console.log();

  console.log("  Balances:");
  for (const addr of addresses) {
    const balance = await vbtc.balanceOf(addr);
    if (balance > 0n) {
      console.log(`    ${addr}: ${formatBTC(balance)} vBTC`);
    }
  }
  console.log();
}

async function queryOracleState(oracle: OracleEMA): Promise<void> {
  console.log("🔮 OracleEMA State");
  console.log("─────────────────────────────────────────────────────");
  console.log("  Address:", await oracle.getAddress());
  console.log("  Owner:", await oracle.owner());

  const [price, ema20, ema50, ema200] = await oracle.get();
  console.log("  Current Price: $" + formatUSD(price));
  console.log("  EMA 20-day: $" + formatUSD(ema20));
  console.log("  EMA 50-day: $" + formatUSD(ema50));
  console.log("  EMA 200-day: $" + formatUSD(ema200));

  const signal = await oracle.getSignal();
  console.log("  Signal:", getSignalName(signal));

  const isBullish = await oracle.isBullish();
  const isBearish = await oracle.isBearish();
  console.log("  Is Bullish:", isBullish);
  console.log("  Is Bearish:", isBearish);

  const lastUpdate = await oracle.lastUpdate();
  const date = new Date(Number(lastUpdate) * 1000);
  console.log("  Last Update:", date.toISOString());
  console.log();
}

async function queryAaveState(aave: MockAave, addresses: string[]): Promise<void> {
  console.log("🏦 MockAave State");
  console.log("─────────────────────────────────────────────────────");
  console.log("  Address:", await aave.getAddress());
  console.log("  VaultBTC:", await aave.vaultBTC());
  console.log("  Supply APR:", Number(await aave.supplyAPR()) / 100, "%");
  console.log("  Borrow APR:", Number(await aave.borrowAPR()) / 100, "%");
  console.log("  Collateral Factor:", Number(await aave.COLLATERAL_FACTOR()) / 100, "%");
  console.log("  Liquidation Threshold:", Number(await aave.LIQUIDATION_THRESHOLD()) / 100, "%");
  console.log();

  console.log("  User Positions:");
  for (const addr of addresses) {
    const supplied = await aave.supplied(addr);
    const borrowed = await aave.borrowed(addr);
    const stablecoin = await aave.stablecoinBalance(addr);

    if (supplied > 0n || borrowed > 0n || stablecoin > 0n) {
      console.log(`    ${addr}:`);
      console.log(`      Supplied: ${formatBTC(supplied)} vBTC`);
      console.log(`      Borrowed: $${formatUSD(borrowed)}`);
      console.log(`      Stablecoin Balance: $${formatUSD(stablecoin)}`);

      const data = await aave.getUserAccountData(addr);
      console.log(`      Available to Borrow: $${formatUSD(data.availableToBorrow)}`);
      if (data.healthFactor < ethers.MaxUint256) {
        console.log(`      Health Factor: ${formatHealthFactor(data.healthFactor)}`);
      } else {
        console.log(`      Health Factor: ∞ (no debt)`);
      }
    }
  }
  console.log();
}

async function queryFactoryState(factory: StrategyFactory, addresses: string[]): Promise<void> {
  console.log("🏭 StrategyFactory State");
  console.log("─────────────────────────────────────────────────────");
  console.log("  Address:", await factory.getAddress());
  console.log("  VaultBTC:", await factory.vaultBTC());
  console.log("  Aave:", await factory.aave());
  console.log("  Oracle:", await factory.oracle());
  console.log("  Total Vaults:", await factory.totalVaults());
  console.log();

  console.log("  Vaults by Owner:");
  for (const addr of addresses) {
    const vaults = await factory.getVaultsByOwner(addr);
    if (vaults.length > 0) {
      console.log(`    ${addr}:`);
      for (let i = 0; i < vaults.length; i++) {
        console.log(`      Vault ${i + 1}: ${vaults[i]}`);
      }
    }
  }
  console.log();
}

async function queryVaultState(vault: LeverageStrategy, owner: string): Promise<void> {
  console.log("🏦 LeverageStrategy Vault State");
  console.log("─────────────────────────────────────────────────────");
  console.log("  Address:", await vault.getAddress());
  console.log("  Owner:", await vault.owner());
  console.log("  VaultBTC:", await vault.vaultBTC());
  console.log("  Aave:", await vault.aave());
  console.log("  Oracle:", await vault.oracle());
  console.log();

  const state = await vault.getVaultState();
  console.log("  Vault State:");
  console.log("    Vault Balance:", formatBTC(state._vaultBalance), "vBTC");
  console.log("    Supplied to Aave:", formatBTC(state._suppliedToAave), "vBTC");
  console.log("    Borrowed from Aave: $" + formatUSD(state._borrowedFromAave));
  console.log("    BTC Position:", formatBTC(state._btcPosition), "vBTC");
  console.log("    Target Leverage:", formatLeverage(state._targetLeverageBps));
  console.log("    Current Leverage:", formatLeverage(state._currentLeverageBps));
  console.log("    Risk Tier:", getRiskName(state._risk));
  console.log();

  const avgPrice = await vault.averageBtcPrice();
  console.log("  Portfolio Metrics:");
  console.log("    Average BTC Price: $" + formatUSD(avgPrice));
  console.log("    Total BTC Purchased:", formatBTC(await vault.totalBtcPurchased()), "vBTC");
  console.log("    Total USD Spent: $" + formatUSD(await vault.totalUsdSpent()));
  console.log();

  // Risk configuration
  const risk = state._risk;
  const config = await vault.riskCfg(risk);
  console.log("  Risk Configuration:");
  console.log("    Max Leverage:", formatLeverage(config.maxBps));
  console.log("    Step Size:", formatLeverage(config.stepBps));
  console.log();
}

// Helper functions
function formatBTC(value: bigint): string {
  return (Number(value) / 1e8).toFixed(8);
}

function formatUSD(value: bigint): string {
  return (Number(value) / 1e8).toFixed(2);
}

function formatLeverage(bps: bigint): string {
  return (Number(bps) / 10000).toFixed(2) + "x";
}

function formatHealthFactor(hf: bigint): string {
  return (Number(hf) / 1e18).toFixed(2);
}

function getRiskName(risk: bigint): string {
  const risks = ["Low (1.1x max)", "Medium (1.3x max)", "High (1.5x max)"];
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
