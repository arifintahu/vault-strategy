
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const VaultBTC = await ethers.getContractFactory("VaultBTC");
  const vbtc = await VaultBTC.deploy();
  await vbtc.waitForDeployment();
  console.log("vaultBTC:", await vbtc.getAddress());

  const Oracle = await ethers.getContractFactory("OracleBands");
  // price=60k, ma=60k, bands +/-5%
  const toInt = (n) => BigInt(Math.floor(n * 1e8));
  const oracle = await Oracle.deploy(toInt(60000), toInt(60000), toInt(63000), toInt(57000));
  await oracle.waitForDeployment();
  console.log("Oracle:", await oracle.getAddress());

  const Strategy = await ethers.getContractFactory("LeverageStrategy");
  const strat = await Strategy.deploy(await vbtc.getAddress(), await oracle.getAddress());
  await strat.waitForDeployment();
  console.log("Strategy:", await strat.getAddress());

  // mint some vBTC for the deployer for demo
  const mintAmt = 10n * 10n ** 8n; // 10 vBTC
  await (await vbtc.mint(deployer.address, mintAmt)).wait();
  console.log("Minted 10 vBTC to deployer");
}

main().catch((e) => { console.error(e); process.exit(1); });
