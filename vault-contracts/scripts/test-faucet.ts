import { ethers } from "hardhat";

async function main() {
  const [user] = await ethers.getSigners();
  
  console.log("🧪 Testing Faucet Feature\n");
  console.log("User:", user.address);
  
  // Get deployed VaultBTC address (update this after deployment)
  const vbtcAddress = process.env.VBTC_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  try {
    const vbtc = await ethers.getContractAt("VaultBTC", vbtcAddress);
    
    console.log("VaultBTC:", vbtcAddress);
    console.log("\n📊 Current Status:");
    
    // Check balance
    const balance = await vbtc.balanceOf(user.address);
    console.log("  Balance:", ethers.formatUnits(balance, 8), "vBTC");
    
    // Check faucet status
    const [canRequest, timeLeft] = await vbtc.canRequestFaucet(user.address);
    console.log("  Can Request:", canRequest);
    console.log("  Time Left:", timeLeft.toString(), "seconds");
    
    if (canRequest) {
      console.log("\n💧 Requesting faucet...");
      const tx = await vbtc.requestFaucet();
      console.log("  Transaction:", tx.hash);
      
      await tx.wait();
      console.log("  ✅ Transaction confirmed!");
      
      const newBalance = await vbtc.balanceOf(user.address);
      console.log("\n📊 New Status:");
      console.log("  Balance:", ethers.formatUnits(newBalance, 8), "vBTC");
      console.log("  Received:", ethers.formatUnits(newBalance - balance, 8), "vBTC");
      
      // Check new status
      const [canRequestAgain, newTimeLeft] = await vbtc.canRequestFaucet(user.address);
      console.log("  Can Request Again:", canRequestAgain);
      console.log("  Time Until Next:", newTimeLeft.toString(), "seconds");
      
      const hours = Math.floor(Number(newTimeLeft) / 3600);
      console.log("  (≈", hours, "hours)");
    } else {
      const hours = Math.floor(Number(timeLeft) / 3600);
      const minutes = Math.floor((Number(timeLeft) % 3600) / 60);
      console.log("\n⏰ Cooldown Active");
      console.log("  Wait:", hours, "hours", minutes, "minutes");
    }
    
    console.log("\n✅ Faucet test completed!");
    
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    
    if (error.message.includes("FAUCET_COOLDOWN")) {
      console.log("\n⏰ You must wait 24 hours between faucet requests");
    } else if (error.message.includes("canRequestFaucet")) {
      console.log("\n⚠️  Faucet function not found. Please redeploy contracts:");
      console.log("   1. Stop Hardhat node");
      console.log("   2. Run: npx hardhat node");
      console.log("   3. Run: npm run setup");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
