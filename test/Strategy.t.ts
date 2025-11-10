import { expect } from "chai";
import { ethers } from "hardhat";
import { VaultBTC, OracleBands, StrategyFactory, LeverageStrategy } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

describe("LeverageStrategy with Factory", function () {
  let vbtc: VaultBTC;
  let oracle: OracleBands;
  let factory: StrategyFactory;
  let owner: HardhatEthersSigner;
  let keeper: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, keeper] = await ethers.getSigners();
    
    // Deploy core contracts
    const VaultBTC = await ethers.getContractFactory("VaultBTC");
    vbtc = await VaultBTC.deploy();
    await vbtc.waitForDeployment();

    const Oracle = await ethers.getContractFactory("OracleBands");
    oracle = await Oracle.deploy(toInt(60000), toInt(60000), toInt(63000), toInt(57000));
    await oracle.waitForDeployment();

    const Factory = await ethers.getContractFactory("StrategyFactory");
    factory = await Factory.deploy(await vbtc.getAddress(), await oracle.getAddress());
    await factory.waitForDeployment();
  });

  it("creates vault via factory, deposits, then increases leverage on dips and decreases on rallies", async function () {
    // Create vault for owner with Medium risk
    const tx = await factory.createVault(1); // 1 = Medium
    await tx.wait();
    
    const vaults = await factory.getVaultsByOwner(owner.address);
    expect(vaults.length).to.equal(1);
    
    const Strategy = await ethers.getContractFactory("LeverageStrategy");
    const strat = Strategy.attach(vaults[0]) as LeverageStrategy;

    // mint & approve
    const mintAmt = 5n * 10n ** 8n; // 5 vBTC
    await (await vbtc.mint(owner.address, mintAmt)).wait();
    await (await vbtc.approve(await strat.getAddress(), mintAmt)).wait();

    // deposit (only owner can deposit)
    await (await strat.deposit(mintAmt)).wait();
    let lev = await strat.currentLeverageBps();
    expect(lev).to.equal(10000n);

    // price dips below lower -> leverage up (anyone can rebalance)
    await (await oracle.setBands(toInt(56000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.connect(keeper).rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(11000n); // 1.1x for Medium risk step 0.1x

    // dip again -> up to 1.2x
    await (await oracle.setBands(toInt(55000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.connect(keeper).rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(12000n);

    // rally above upper -> deleverage back toward 1.0x
    await (await oracle.setBands(toInt(64000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.connect(keeper).rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(11000n);

    // rally more -> 1.0x
    await (await oracle.setBands(toInt(65000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.connect(keeper).rebalance()).wait();
    lev = await strat.currentLeverageBps();
    expect(lev).to.equal(10000n);
    
    // verify only owner can withdraw
    await expect(strat.connect(keeper).withdraw(1n * 10n ** 8n)).to.be.revertedWith("ONLY_OWNER");
  });

  it("allows multiple users to create their own vaults", async function () {
    const [user1, user2, user3] = await ethers.getSigners();

    // User 1 creates Low risk vault
    await factory.connect(user1).createVault(0);
    const vaults1 = await factory.getVaultsByOwner(user1.address);
    expect(vaults1.length).to.equal(1);

    // User 2 creates Medium risk vault
    await factory.connect(user2).createVault(1);
    const vaults2 = await factory.getVaultsByOwner(user2.address);
    expect(vaults2.length).to.equal(1);

    // User 3 creates High risk vault
    await factory.connect(user3).createVault(2);
    const vaults3 = await factory.getVaultsByOwner(user3.address);
    expect(vaults3.length).to.equal(1);

    // Verify total vaults
    const totalVaults = await factory.totalVaults();
    expect(totalVaults).to.equal(3n);

    // Verify vaults are different
    expect(vaults1[0]).to.not.equal(vaults2[0]);
    expect(vaults2[0]).to.not.equal(vaults3[0]);
  });

  it("tracks vault state correctly", async function () {
    // Create vault
    await factory.createVault(1); // Medium risk
    const vaults = await factory.getVaultsByOwner(owner.address);
    const Strategy = await ethers.getContractFactory("LeverageStrategy");
    const strat = Strategy.attach(vaults[0]) as LeverageStrategy;

    // Mint and deposit
    const mintAmt = 5n * 10n ** 8n;
    await (await vbtc.mint(owner.address, mintAmt)).wait();
    await (await vbtc.approve(await strat.getAddress(), mintAmt)).wait();
    await (await strat.deposit(mintAmt)).wait();

    // Check initial state
    let state = await strat.getVaultState();
    expect(state._collateral).to.equal(mintAmt);
    expect(state._debt).to.equal(0n);
    expect(state._positionSize).to.equal(mintAmt); // 1.0x leverage
    expect(state._targetLeverageBps).to.equal(10000n);
    expect(state._currentLeverageBps).to.equal(10000n);
    expect(state._risk).to.equal(1); // Medium

    // Trigger rebalance on dip
    await (await oracle.setBands(toInt(56000), toInt(60000), toInt(63000), toInt(57000))).wait();
    await (await strat.rebalance()).wait();

    // Check state after leverage increase
    state = await strat.getVaultState();
    expect(state._collateral).to.equal(mintAmt);
    expect(state._targetLeverageBps).to.equal(11000n); // 1.1x
    expect(state._currentLeverageBps).to.equal(11000n);
    expect(state._debt).to.be.greaterThan(0n); // Should have synthetic debt
  });
});
