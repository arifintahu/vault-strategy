import { ethers } from "hardhat";
import type { VaultBTC, MockAave } from "../typechain-types";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

/**
 * Supply vBTC to Aave lending pool
 * Usage: npx hardhat run scripts/supply-aave.ts --network localhost
 * 
 * This script demonstrates:
 * 1. Supplying collateral to Aave
 * 2. Borrowing against collateral
 * 3. Repaying debt
 * 4. Withdrawing collateral
 */
async function main(): Promise<void> {
  console.log("🏦 Aave Supply & Borrow Script\n");

  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("👥 Accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("  User2:", user2.address);
  console.log();

  // Deploy contracts
  console.log("📦 Deploying contracts...");
  const VaultBTC = await ethers.getContractFactory("VaultBTC");
  const vbtc = await VaultBTC.deploy() as VaultBTC;
  await vbtc.waitForDeployment();
  console.log("  ✅ VaultBTC:", await vbtc.getAddress());

  const MockAave = await ethers.getContractFactory("MockAave");
  const aave = await MockAave.deploy(await vbtc.getAddress()) as MockAave;
  await aave.waitForDeployment();
  console.log("  ✅ MockAave:", await aave.getAddress());
  console.log();

  // Mint vBTC to users
  console.log("💰 Minting vBTC...");
  await vbtc.mint(user1.address, toInt(10));
  console.log("  ✅ User1: 10 vBTC");
  await vbtc.mint(user2.address, toInt(5));
  console.log("  ✅ User2: 5 vBTC");
  console.log();

  // Display Aave configuration
  console.log("⚙️  Aave Configuration:");
  console.log("  Supply APR:", Number(await aave.supplyAPR()) / 100, "%");
  console.log("  Borrow APR:", Number(await aave.borrowAPR()) / 100, "%");
  console.log("  Collateral Factor:", Number(await aave.COLLATERAL_FACTOR()) / 100, "%");
  console.log("  Liquidation Threshold:", Number(await aave.LIQUIDATION_THRESHOLD()) / 100, "%");
  console.log();

  // ========== USER 1: SUPPLY AND BORROW ==========
  console.log("═══════════════════════════════════════════════════════");
  console.log("👤 User1: Supply and Borrow");
  console.log("═══════════════════════════════════════════════════════\n");

  // Supply collateral
  console.log("📥 Step 1: Supply Collateral");
  const supplyAmount1 = toInt(5);
  await vbtc.connect(user1).approve(await aave.getAddress(), supplyAmount1);
  await aave.connect(user1).supply(supplyAmount1);
  console.log(`  ✅ Supplied ${formatBTC(supplyAmount1)} vBTC`);
  await displayUserPosition(aave, user1.address, "User1");

  // Borrow against collateral
  console.log("💸 Step 2: Borrow Stablecoin");
  const btcPrice = toInt(60000);
  const borrowAmount1 = toInt(100000); // $100k
  await aave.connect(user1).borrow(borrowAmount1, btcPrice);
  console.log(`  ✅ Borrowed $${formatUSD(borrowAmount1)}`);
  await displayUserPosition(aave, user1.address, "User1");

  // Borrow more
  console.log("💸 Step 3: Borrow More");
  const borrowAmount2 = toInt(50000); // $50k more
  await aave.connect(user1).borrow(borrowAmount2, btcPrice);
  console.log(`  ✅ Borrowed additional $${formatUSD(borrowAmount2)}`);
  await displayUserPosition(aave, user1.address, "User1");

  // Repay some debt
  console.log("💰 Step 4: Repay Debt");
  const repayAmount = toInt(75000); // Repay $75k
  await aave.connect(user1).repay(repayAmount);
  console.log(`  ✅ Repaid $${formatUSD(repayAmount)}`);
  await displayUserPosition(aave, user1.address, "User1");

  // Withdraw some collateral
  console.log("📤 Step 5: Withdraw Collateral");
  const withdrawAmount = toInt(2);
  await aave.connect(user1).withdraw(withdrawAmount);
  console.log(`  ✅ Withdrew ${formatBTC(withdrawAmount)} vBTC`);
  await displayUserPosition(aave, user1.address, "User1");

  // ========== USER 2: SUPPLY ONLY ==========
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("👤 User2: Supply Only (Earn Yield)");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("📥 Supply Collateral");
  const supplyAmount2 = toInt(5);
  await vbtc.connect(user2).approve(await aave.getAddress(), supplyAmount2);
  await aave.connect(user2).supply(supplyAmount2);
  console.log(`  ✅ Supplied ${formatBTC(supplyAmount2)} vBTC`);
  await displayUserPosition(aave, user2.address, "User2");

  // ========== SUMMARY ==========
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("📊 Final Summary");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("User1 Final Position:");
  await displayUserPosition(aave, user1.address, "User1");

  console.log("User2 Final Position:");
  await displayUserPosition(aave, user2.address, "User2");

  // Calculate total protocol stats
  const totalSupplied = await aave.supplied(user1.address) + await aave.supplied(user2.address);
  const totalBorrowed = await aave.borrowed(user1.address) + await aave.borrowed(user2.address);

  console.log("Protocol Statistics:");
  console.log(`  Total Supplied: ${formatBTC(totalSupplied)} vBTC`);
  console.log(`  Total Borrowed: $${formatUSD(totalBorrowed)}`);
  console.log(`  Utilization: ${calculateUtilization(totalSupplied, totalBorrowed, btcPrice)}%`);
  console.log();

  console.log("✅ Aave Supply Script Complete!");
}

async function displayUserPosition(aave: MockAave, userAddress: string, label: string): Promise<void> {
  const supplied = await aave.supplied(userAddress);
  const borrowed = await aave.borrowed(userAddress);
  const stablecoin = await aave.stablecoinBalance(userAddress);
  const data = await aave.getUserAccountData(userAddress);

  console.log(`\n  ${label} Position:`);
  console.log(`    Supplied: ${formatBTC(supplied)} vBTC`);
  console.log(`    Borrowed: $${formatUSD(borrowed)}`);
  console.log(`    Stablecoin Balance: $${formatUSD(stablecoin)}`);
  console.log(`    Available to Borrow: $${formatUSD(data.availableToBorrow)}`);

  if (data.healthFactor < ethers.MaxUint256) {
    const hf = Number(data.healthFactor) / 1e18;
    console.log(`    Health Factor: ${hf.toFixed(2)}`);

    if (hf > 2) {
      console.log(`    Status: ✅ Very Healthy`);
    } else if (hf > 1.5) {
      console.log(`    Status: ✅ Healthy`);
    } else if (hf > 1.2) {
      console.log(`    Status: ⚠️  Moderate Risk`);
    } else if (hf > 1.0) {
      console.log(`    Status: ⚠️  High Risk`);
    } else {
      console.log(`    Status: ❌ Liquidation Risk`);
    }
  } else {
    console.log(`    Health Factor: ∞ (no debt)`);
    console.log(`    Status: ✅ No Risk`);
  }
  console.log();
}

function formatBTC(value: bigint): string {
  return (Number(value) / 1e8).toFixed(4);
}

function formatUSD(value: bigint): string {
  return (Number(value) / 1e8).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function calculateUtilization(supplied: bigint, borrowed: bigint, btcPrice: bigint): string {
  if (supplied === 0n) return "0.00";
  const suppliedValue = supplied * btcPrice / toInt(1);
  const utilization = Number(borrowed * 10000n / suppliedValue) / 100;
  return utilization.toFixed(2);
}

main().catch((error: Error) => {
  console.error(error);
  process.exit(1);
});
