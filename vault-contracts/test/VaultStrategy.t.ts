import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { VaultBTC, MockAave, OracleEMA, LeverageStrategy, StrategyFactory } from "../typechain-types";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

describe("Vault Strategy with EMA and Aave", function () {
  let vbtc: VaultBTC;
  let aave: MockAave;
  let oracle: OracleEMA;
  let factory: StrategyFactory;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy VaultBTC
    const VaultBTC = await ethers.getContractFactory("VaultBTC");
    vbtc = await VaultBTC.deploy();
    await vbtc.waitForDeployment();

    // Deploy MockAave
    const MockAave = await ethers.getContractFactory("MockAave");
    aave = await MockAave.deploy(await vbtc.getAddress());
    await aave.waitForDeployment();

    // Deploy Oracle with bullish setup
    // price=60k, ema20=59k, ema50=58k, ema200=55k
    const Oracle = await ethers.getContractFactory("OracleEMA");
    oracle = await Oracle.deploy(
      toInt(60000),
      toInt(59000),
      toInt(58000),
      toInt(55000)
    );
    await oracle.waitForDeployment();

    // Deploy Factory
    const Factory = await ethers.getContractFactory("StrategyFactory");
    factory = await Factory.deploy(
      await vbtc.getAddress(),
      await aave.getAddress(),
      await oracle.getAddress()
    );
    await factory.waitForDeployment();

    // Mint vBTC to users
    await vbtc.mint(user1.address, toInt(10)); // 10 vBTC
    await vbtc.mint(user2.address, toInt(5));  // 5 vBTC
  });

  describe("Oracle EMA", function () {
    it("should return correct EMA values", async function () {
      const [price, ema20, ema50, ema200] = await oracle.get();
      expect(price).to.equal(toInt(60000));
      expect(ema20).to.equal(toInt(59000));
      expect(ema50).to.equal(toInt(58000));
      expect(ema200).to.equal(toInt(55000));
    });

    it("should detect bullish signal when price above EMAs", async function () {
      const signal = await oracle.getSignal();
      expect(signal).to.equal(2); // Strong bullish
      
      const isBullish = await oracle.isBullish();
      expect(isBullish).to.be.true;
    });

    it("should detect bearish signal when price below EMAs", async function () {
      // Set bearish conditions: price below all EMAs
      await oracle.setEMAs(
        toInt(50000),  // price
        toInt(55000),  // ema20
        toInt(58000),  // ema50
        toInt(60000)   // ema200
      );
      
      const signal = await oracle.getSignal();
      expect(signal).to.equal(-2); // Strong bearish
      
      const isBearish = await oracle.isBearish();
      expect(isBearish).to.be.true;
    });
  });

  describe("MockAave", function () {
    it("should allow supply and withdraw", async function () {
      const amount = toInt(1);
      
      await vbtc.connect(user1).approve(await aave.getAddress(), amount);
      await aave.connect(user1).supply(amount);
      
      const supplied = await aave.supplied(user1.address);
      expect(supplied).to.equal(amount);
      
      await aave.connect(user1).withdraw(amount);
      expect(await aave.supplied(user1.address)).to.equal(0n);
    });

    it("should allow borrow against collateral", async function () {
      const collateral = toInt(1); // 1 BTC
      const btcPrice = toInt(60000);
      
      await vbtc.connect(user1).approve(await aave.getAddress(), collateral);
      await aave.connect(user1).supply(collateral);
      
      // Can borrow up to 75% of collateral value
      const maxBorrow = (collateral * btcPrice * 75n) / (100n * 10n ** 8n);
      const borrowAmount = maxBorrow / 2n; // Borrow 50% of max
      
      await aave.connect(user1).borrow(borrowAmount, btcPrice);
      
      const borrowed = await aave.borrowed(user1.address);
      expect(borrowed).to.equal(borrowAmount);
    });

    it("should allow repay", async function () {
      const collateral = toInt(1);
      const btcPrice = toInt(60000);
      const borrowAmount = toInt(20000); // $20k
      
      await vbtc.connect(user1).approve(await aave.getAddress(), collateral);
      await aave.connect(user1).supply(collateral);
      await aave.connect(user1).borrow(borrowAmount, btcPrice);
      
      await aave.connect(user1).repay(borrowAmount);
      expect(await aave.borrowed(user1.address)).to.equal(0n);
    });
  });

  describe("LeverageStrategy - Vault Balance", function () {
    let strategy: LeverageStrategy;

    beforeEach(async function () {
      // Create vault for user1
      const tx = await factory.connect(user1).createVault(1); // Medium risk
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog(log)?.name === "VaultCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = factory.interface.parseLog(event as any);
      const vaultAddress = parsedEvent?.args[1];
      
      strategy = await ethers.getContractAt("LeverageStrategy", vaultAddress);
    });

    it("should deposit to vault balance (not collateral)", async function () {
      const amount = toInt(5);
      
      await vbtc.connect(user1).approve(await strategy.getAddress(), amount);
      await strategy.connect(user1).deposit(amount);
      
      const state = await strategy.getVaultState();
      expect(state._vaultBalance).to.equal(amount);
      expect(state._suppliedToAave).to.equal(0n); // Not yet supplied
    });

    it("should supply vault balance to Aave", async function () {
      const amount = toInt(5);
      
      await vbtc.connect(user1).approve(await strategy.getAddress(), amount);
      await strategy.connect(user1).deposit(amount);
      
      // Supply to Aave
      await strategy.supplyToAave(amount);
      
      const state = await strategy.getVaultState();
      expect(state._suppliedToAave).to.equal(amount);
      expect(state._btcPosition).to.equal(amount);
    });

    it("should not allow withdraw of supplied balance", async function () {
      const amount = toInt(5);
      
      await vbtc.connect(user1).approve(await strategy.getAddress(), amount);
      await strategy.connect(user1).deposit(amount);
      await strategy.supplyToAave(amount);
      
      // Try to withdraw (should fail)
      await expect(
        strategy.connect(user1).withdraw(amount)
      ).to.be.revertedWith("INSUFFICIENT_FREE");
    });

    it("should allow withdraw of free balance", async function () {
      const depositAmount = toInt(5);
      const supplyAmount = toInt(3);
      
      await vbtc.connect(user1).approve(await strategy.getAddress(), depositAmount);
      await strategy.connect(user1).deposit(depositAmount);
      await strategy.supplyToAave(supplyAmount);
      
      // Withdraw free balance (2 vBTC)
      const freeBalance = depositAmount - supplyAmount;
      await strategy.connect(user1).withdraw(freeBalance);
      
      const state = await strategy.getVaultState();
      expect(state._vaultBalance).to.equal(supplyAmount);
    });
  });

  describe("LeverageStrategy - Rebalancing", function () {
    let strategy: LeverageStrategy;

    beforeEach(async function () {
      // Create vault for user1 with Medium risk
      const tx = await factory.connect(user1).createVault(1);
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog(log)?.name === "VaultCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = factory.interface.parseLog(event as any);
      const vaultAddress = parsedEvent?.args[1];
      
      strategy = await ethers.getContractAt("LeverageStrategy", vaultAddress);
      
      // Deposit and supply to Aave
      const amount = toInt(5);
      await vbtc.connect(user1).approve(await strategy.getAddress(), amount);
      await strategy.connect(user1).deposit(amount);
      await strategy.supplyToAave(amount);
    });

    it("should increase leverage on bullish signal", async function () {
      // Oracle is already bullish (price above EMAs)
      await strategy.rebalance();
      
      const state = await strategy.getVaultState();
      expect(state._targetLeverageBps).to.be.gt(10000n); // > 1.0x
      expect(state._borrowedFromAave).to.be.gt(0n);
      expect(state._btcPosition).to.be.gt(state._suppliedToAave);
    });

    it("should track average BTC purchase price", async function () {
      await strategy.rebalance();
      
      const avgPrice = await strategy.averageBtcPrice();
      expect(avgPrice).to.be.gt(0n);
      expect(avgPrice).to.be.closeTo(toInt(60000), toInt(1000)); // Within $1k
    });

    it("should decrease leverage on bearish signal", async function () {
      // First increase leverage
      await strategy.rebalance();
      
      const stateBefore = await strategy.getVaultState();
      expect(stateBefore._targetLeverageBps).to.be.gt(10000n);
      
      // Set bearish conditions
      await oracle.setEMAs(
        toInt(50000),  // price drops
        toInt(55000),
        toInt(58000),
        toInt(60000)
      );
      
      // Rebalance should decrease leverage
      await strategy.rebalance();
      
      const stateAfter = await strategy.getVaultState();
      expect(stateAfter._targetLeverageBps).to.be.lt(stateBefore._targetLeverageBps);
    });

    it("should respect max leverage based on risk tier", async function () {
      // Medium risk: max 1.3x (13000 bps)
      // Rebalance multiple times
      for (let i = 0; i < 5; i++) {
        await strategy.rebalance();
      }
      
      const state = await strategy.getVaultState();
      expect(state._targetLeverageBps).to.be.lte(13000n);
    });

    it("should not go below 1.0x leverage", async function () {
      // Set bearish and rebalance multiple times
      await oracle.setEMAs(toInt(50000), toInt(55000), toInt(58000), toInt(60000));
      
      for (let i = 0; i < 5; i++) {
        await strategy.rebalance();
      }
      
      const state = await strategy.getVaultState();
      expect(state._targetLeverageBps).to.be.gte(10000n);
    });
  });

  describe("Risk Tiers", function () {
    it("should create vault with Low risk (1.1x max)", async function () {
      const tx = await factory.connect(user1).createVault(0); // Low risk
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog(log)?.name === "VaultCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = factory.interface.parseLog(event as any);
      const vaultAddress = parsedEvent?.args[1];
      
      const strategy = await ethers.getContractAt("LeverageStrategy", vaultAddress);
      
      // Deposit and supply
      const amount = toInt(5);
      await vbtc.connect(user1).approve(await strategy.getAddress(), amount);
      await strategy.connect(user1).deposit(amount);
      await strategy.supplyToAave(amount);
      
      // Rebalance multiple times
      for (let i = 0; i < 5; i++) {
        await strategy.rebalance();
      }
      
      const state = await strategy.getVaultState();
      expect(state._targetLeverageBps).to.be.lte(11000n); // Max 1.1x
    });

    it("should create vault with High risk (1.5x max)", async function () {
      const tx = await factory.connect(user1).createVault(2); // High risk
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog(log)?.name === "VaultCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = factory.interface.parseLog(event as any);
      const vaultAddress = parsedEvent?.args[1];
      
      const strategy = await ethers.getContractAt("LeverageStrategy", vaultAddress);
      
      // Deposit and supply
      const amount = toInt(5);
      await vbtc.connect(user1).approve(await strategy.getAddress(), amount);
      await strategy.connect(user1).deposit(amount);
      await strategy.supplyToAave(amount);
      
      // Rebalance multiple times
      for (let i = 0; i < 5; i++) {
        await strategy.rebalance();
      }
      
      const state = await strategy.getVaultState();
      expect(state._targetLeverageBps).to.be.lte(15000n); // Max 1.5x
    });
  });

  describe("Factory", function () {
    it("should track vaults by owner", async function () {
      await factory.connect(user1).createVault(0);
      await factory.connect(user1).createVault(1);
      await factory.connect(user2).createVault(2);
      
      const user1Vaults = await factory.getVaultsByOwner(user1.address);
      const user2Vaults = await factory.getVaultsByOwner(user2.address);
      
      expect(user1Vaults.length).to.equal(2);
      expect(user2Vaults.length).to.equal(1);
      expect(await factory.totalVaults()).to.equal(3);
    });
  });
});
