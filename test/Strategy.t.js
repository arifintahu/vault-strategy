
const { expect } = require("chai");
const { ethers } = require("hardhat");

const toInt = (n) => BigInt(Math.floor(n * 1e8));

describe("LeverageStrategy demo", function () {
  it("deposits, then increases leverage on dips and decreases on rallies", async function () {
    const [u] = await ethers.getSigners();
    const VaultBTC = await ethers.getContractFactory("VaultBTC");
    const vbtc = await VaultBTC.deploy();
    await vbtc.waitForDeployment();

    const Oracle = await ethers.getContractFactory("OracleBands");
    const oracle = await Oracle.deploy(toInt(60000), toInt(60000), toInt(63000), toInt(57000));
    await oracle.waitForDeployment();

    const Strategy = await ethers.getContractFactory("LeverageStrategy");
    const strat = await Strategy.deploy(await vbtc.getAddress(), await oracle.getAddress());
    await strat.waitForDeployment();

    // mint & approve
    const mintAmt = 5n * 10n ** 8n; // 5 vBTC
    await (await vbtc.mint(u.address, mintAmt)).wait();
    await (await vbtc.approve(await strat.getAddress(), mintAmt)).wait();

    // deposit
    await (await strat.deposit(mintAmt)).wait();
    let lev = await strat.currentLeverageBps();
    expect(lev).to.equal(10000);

    // price dips below lower -> leverage up
    await (await oracle.setBands(toInt(56000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(11000); // 1.1x for Medium risk step 0.1x

    // dip again -> up to 1.2x
    await (await oracle.setBands(toInt(55000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(12000);

    // rally above upper -> deleverage back toward 1.0x
    await (await oracle.setBands(toInt(64000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(11000);

    // rally more -> 1.0x
    await (await oracle.setBands(toInt(65000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(10000);
  });
});
