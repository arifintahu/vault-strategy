import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Initializing oracle with deployer:", deployer.address);

  // Get deployed contract addresses
  const oracleAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  // Get contract instance
  const oracle = await ethers.getContractAt("OracleEMA", oracleAddress);
  
  // Set initial prices (using 8 decimals as per contract)
  // BTC price: $50,000
  const price = 5000000000000; // 50000 * 10^8
  const ema20 = 4950000000000;  // $49,500 (slightly below)
  const ema50 = 4900000000000;  // $49,000
  const ema200 = 4800000000000; // $48,000
  
  console.log("Setting oracle data:");
  console.log("  Price:", price / 1e8);
  console.log("  EMA20:", ema20 / 1e8);
  console.log("  EMA50:", ema50 / 1e8);
  console.log("  EMA200:", ema200 / 1e8);
  
  const tx = await oracle.setEMAs(price, ema20, ema50, ema200);
  await tx.wait();
  
  console.log("Oracle initialized!");
  
  // Verify by reading the price
  const [priceRead, ema20Read, ema50Read, ema200Read] = await oracle.get();
  const signal = await oracle.getSignal();
  const isBullish = await oracle.isBullish();
  
  console.log("\n✅ Oracle initialized successfully!");
  console.log("\nCurrent Oracle Data:");
  console.log("  Price: $" + (Number(priceRead) / 1e8).toLocaleString());
  console.log("  EMA20: $" + (Number(ema20Read) / 1e8).toLocaleString());
  console.log("  EMA50: $" + (Number(ema50Read) / 1e8).toLocaleString());
  console.log("  EMA200: $" + (Number(ema200Read) / 1e8).toLocaleString());
  console.log("  Signal:", signal, isBullish ? "(Bullish)" : "(Bearish/Neutral)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
