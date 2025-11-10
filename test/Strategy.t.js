
const { expect } = require("chai");
const { ethers } = require("hardhat");

const toInt = (n) => BigInt(Math.floor(n * 1e8));

describe("LeverageStrategy with Factory", function () {
  it("creates vault via factory, deposits, then increases leverage on dips and decreases on rallies", async function () {
    const [owner, keeper] = await ethers.getSigners();
    
    // Deploy core contracts
    const VaultBTC = await ethers.getContractFactory("VaultBTC");
    const vbtc = await VaultBTC.deploy();
    await vbtc.waitForDeployment();

    const Oracle = await ethers.getContractFactory("OracleBands");
    const oracle = await Oracle.deploy(toInt(60000), toInt(60000), toInt(63000), toInt(57000));
    await oracle.waitForDeployment();

    const Factory = await ethers.getContractFactory("StrategyFactory");
    const factory = await Factory.deploy(await vbtc.getAddress(), await oracle.getAddress());
    await factory.waitForDeployment();

    // Create vault for owner with Medium risk
    const tx = await factory.createVault(1); // 1 = Medium
    await tx.wait();
    
    const vaults = await factory.getVaultsByOwner(owner.address);
    expect(vaults.length).to.equal(1);
    
    const Strategy = await ethers.getContractFactory("LeverageStrategy");
    const strat = Strategy.attach(vaults[0]);

    // mint & approve
    const mintAmt = 5n * 10n ** 8n; // 5 vBTC
    await (await vbtc.mint(owner.address, mintAmt)).wait();
    await (await vbtc.approve(await strat.getAddress(), mintAmt)).wait();

    // deposit (only owner can deposit)
    await (await strat.deposit(mintAmt)).wait();
    let lev = await strat.currentLeverageBps();
    expect(lev).to.equal(10000);

    // price dips below lower -> leverage up (anyone can rebalance)
    await (await oracle.setBands(toInt(56000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.connect(keeper).rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(11000); // 1.1x for Medium risk step 0.1x

    // dip again -> up to 1.2x
    await (await oracle.setBands(toInt(55000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.connect(keeper).rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(12000);

    // rally above upper -> deleverage back toward 1.0x
    await (await oracle.setBands(toInt(64000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.connect(keeper).rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(11000);

    // rally more -> 1.0x
    await (await oracle.setBands(toInt(65000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.connect(keeper).rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(10000);
    
    // verify only owner can withdraw
    await expect(strat.connect(keeper).withdraw(1n * 10n ** 8n)).to.be.revertedWith("ONLY_OWNER");
  });
});
