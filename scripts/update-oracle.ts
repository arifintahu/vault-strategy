import { ethers } from "hardhat";
import type { OracleEMA } from "../typechain-types";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

/**
 * Update Oracle EMA data
 * Usage: npx hardhat run scripts/update-oracle.ts --network localhost
 * 
 * This script simulates updating oracle data with new price and EMA values
 */
async function main(): Promise<void> {
  console.log("🔮 Oracle Update Script\n");

  const [owner] = await ethers.getSigners();
  console.log("Owner:", owner.address);
  console.log();

  // Get oracle address (in production, use deployed address)
  // For demo, deploy a new oracle
  const Oracle = await ethers.getContractFactory("OracleEMA");
  const oracle = await Oracle.deploy(
    toInt(60000),  // initial price
    toInt(59000),  // initial ema20
    toInt(58000),  // initial ema50
    toInt(55000)   // initial ema200
  ) as OracleEMA;
  await oracle.waitForDeployment();

  const oracleAddress = await oracle.getAddress();
  console.log("Oracle Address:", oracleAddress);
  console.log();

  // Display current state
  console.log("📊 Current Oracle State:");
  await displayOracleState(oracle);
  console.log();

  // ========== UPDATE SCENARIOS ==========

  // Scenario 1: Bullish market
  console.log("═══════════════════════════════════════════════════════");
  console.log("📈 Scenario 1: Bullish Market Update");
  console.log("═══════════════════════════════════════════════════════");
  await updateOracle(oracle, {
    price: 65000,
    ema20: 63000,
    ema50: 61000,
    ema200: 58000,
    description: "Price rises above all EMAs - Strong bullish signal"
  });

  // Scenario 2: Continued rally
  console.log("═══════════════════════════════════════════════════════");
  console.log("📈 Scenario 2: Continued Rally");
  console.log("═══════════════════════════════════════════════════════");
  await updateOracle(oracle, {
    price: 70000,
    ema20: 68000,
    ema50: 65000,
    ema200: 62000,
    description: "Strong uptrend continues"
  });

  // Scenario 3: Bearish reversal
  console.log("═══════════════════════════════════════════════════════");
  console.log("📉 Scenario 3: Bearish Reversal");
  console.log("═══════════════════════════════════════════════════════");
  await updateOracle(oracle, {
    price: 55000,
    ema20: 58000,
    ema50: 60000,
    ema200: 62000,
    description: "Price drops below all EMAs - Strong bearish signal"
  });

  // Scenario 4: Neutral/consolidation
  console.log("═══════════════════════════════════════════════════════");
  console.log("➡️  Scenario 4: Neutral/Consolidation");
  console.log("═══════════════════════════════════════════════════════");
  await updateOracle(oracle, {
    price: 59000,
    ema20: 58500,
    ema50: 59500,
    ema200: 60000,
    description: "Mixed signals - Price between EMAs"
  });

  // Scenario 5: Recovery
  console.log("═══════════════════════════════════════════════════════");
  console.log("📈 Scenario 5: Market Recovery");
  console.log("═══════════════════════════════════════════════════════");
  await updateOracle(oracle, {
    price: 62000,
    ema20: 61000,
    ema50: 60000,
    ema200: 59000,
    description: "Price recovers above all EMAs"
  });

  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ Oracle Update Complete");
  console.log("═══════════════════════════════════════════════════════");
}

interface OracleUpdate {
  price: number;
  ema20: number;
  ema50: number;
  ema200: number;
  description: string;
}

async function updateOracle(oracle: OracleEMA, update: OracleUpdate): Promise<void> {
  console.log(`\n📝 ${update.description}`);
  console.log();

  console.log("  New Values:");
  console.log(`    Price: $${update.price.toLocaleString()}`);
  console.log(`    EMA20: $${update.ema20.toLocaleString()}`);
  console.log(`    EMA50: $${update.ema50.toLocaleString()}`);
  console.log(`    EMA200: $${update.ema200.toLocaleString()}`);
  console.log();

  // Update oracle
  const tx = await oracle.setEMAs(
    toInt(update.price),
    toInt(update.ema20),
    toInt(update.ema50),
    toInt(update.ema200)
  );
  await tx.wait();

  console.log("  ✅ Oracle updated");
  console.log();

  // Display new state
  await displayOracleState(oracle);
  console.log();
}

async function displayOracleState(oracle: OracleEMA): Promise<void> {
  const [price, ema20, ema50, ema200] = await oracle.get();
  const signal = await oracle.getSignal();
  const isBullish = await oracle.isBullish();
  const isBearish = await oracle.isBearish();
  const lastUpdate = await oracle.lastUpdate();

  console.log("  Current State:");
  console.log(`    Price: $${formatUSD(price)}`);
  console.log(`    EMA20: $${formatUSD(ema20)}`);
  console.log(`    EMA50: $${formatUSD(ema50)}`);
  console.log(`    EMA200: $${formatUSD(ema200)}`);
  console.log(`    Signal: ${getSignalName(signal)}`);
  console.log(`    Is Bullish: ${isBullish}`);
  console.log(`    Is Bearish: ${isBearish}`);

  const date = new Date(Number(lastUpdate) * 1000);
  console.log(`    Last Update: ${date.toISOString()}`);

  // Price vs EMAs analysis
  console.log();
  console.log("  Analysis:");
  if (price > ema20 && price > ema50 && price > ema200) {
    console.log("    ✅ Price above all EMAs - Strong uptrend");
  } else if (price < ema20 && price < ema50 && price < ema200) {
    console.log("    ❌ Price below all EMAs - Strong downtrend");
  } else if (price > ema20 && price > ema50) {
    console.log("    📈 Price above short-term EMAs - Bullish");
  } else if (price < ema20 && price < ema50) {
    console.log("    📉 Price below short-term EMAs - Bearish");
  } else {
    console.log("    ➡️  Mixed signals - Consolidation");
  }

  // Recommendation
  console.log();
  console.log("  Strategy Recommendation:");
  if (signal >= 1n) {
    console.log("    📈 Increase leverage (bullish signal)");
  } else if (signal <= -1n) {
    console.log("    📉 Decrease leverage (bearish signal)");
  } else {
    console.log("    ⏸️  Hold current position (neutral)");
  }
}

function formatUSD(value: bigint): string {
  return Number(value / 100n).toLocaleString();
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
