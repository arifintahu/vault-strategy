import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { VaultBTC, MockAave, OracleEMA, StrategyFactory, LeverageStrategy } from "../typechain-types";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

describe("StrategyFactory", function () {
  let vbtc: VaultBTC;
  let aave: MockAave;
  let oracle: OracleEMA;
  let factory: StrategyFactory;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy VaultBTC
    const VaultBTC = await ethers.getContractFactory("VaultBTC");
    vbtc = await VaultBTC.deploy();
    await vbtc.waitForDeployment();

    // Deploy MockAave
    const MockAave = await ethers.getContractFactory("MockAave");
    aave = await MockAave.deploy(await vbtc.getAddress());
    await aave.waitForDeployment();

    // Deploy Oracle
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
  });

  describe("Deployment", function () {
    it("should set vaultBTC address", async function () {
      expect(await factory.vaultBTC()).to.equal(await vbtc.getAddress());
    });

    it("should set aave address", async function () {
      expect(await factory.aave()).to.equal(await aave.getAddress());
    });

    it("should set oracle address", async function () {
      expect(await factory.oracle()).to.equal(await oracle.getAddress());
    });

    it("should start with zero vaults", async function () {
      expect(await factory.totalVaults()).to.equal(0);
    });
  });

  describe("Create Vault", function () {
    it("should create vault with Low risk", async function () {
      const tx = await factory.connect(user1).createVault(0); // Low risk
      const receipt = await tx.wait();

      expect(await factory.totalVaults()).to.equal(1);

      const vaults = await factory.getVaultsByOwner(user1.address);
      expect(vaults.length).to.equal(1);

      // Verify vault is a LeverageStrategy
      const strategy = await ethers.getContractAt("LeverageStrategy", vaults[0]);
      expect(await strategy.owner()).to.equal(user1.address);
    });

    it("should create vault with Medium risk", async function () {
      await factory.connect(user1).createVault(1); // Medium risk

      const vaults = await factory.getVaultsByOwner(user1.address);
      const strategy = await ethers.getContractAt("LeverageStrategy", vaults[0]);

      const state = await strategy.getVaultState();
      expect(state._risk).to.equal(1); // Medium
    });

    it("should create vault with High risk", async function () {
      await factory.connect(user1).createVault(2); // High risk

      const vaults = await factory.getVaultsByOwner(user1.address);
      const strategy = await ethers.getContractAt("LeverageStrategy", vaults[0]);

      const state = await strategy.getVaultState();
      expect(state._risk).to.equal(2); // High
    });

    it("should emit VaultCreated event", async function () {
      const tx = await factory.connect(user1).createVault(1);
      const receipt = await tx.wait();

      const event = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog(log)?.name === "VaultCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = factory.interface.parseLog(event as any);
      expect(parsedEvent?.args[0]).to.equal(user1.address); // owner
      expect(parsedEvent?.args[2]).to.equal(1); // risk
      expect(parsedEvent?.args[3]).to.equal(0); // vaultIndex
    });

    it("should allow user to create multiple vaults", async function () {
      await factory.connect(user1).createVault(0); // Low
      await factory.connect(user1).createVault(1); // Medium
      await factory.connect(user1).createVault(2); // High

      const vaults = await factory.getVaultsByOwner(user1.address);
      expect(vaults.length).to.equal(3);
      expect(await factory.totalVaults()).to.equal(3);
    });

    it("should create independent vaults for different users", async function () {
      await factory.connect(user1).createVault(0);
      await factory.connect(user2).createVault(1);
      await factory.connect(user3).createVault(2);

      const vaults1 = await factory.getVaultsByOwner(user1.address);
      const vaults2 = await factory.getVaultsByOwner(user2.address);
      const vaults3 = await factory.getVaultsByOwner(user3.address);

      expect(vaults1.length).to.equal(1);
      expect(vaults2.length).to.equal(1);
      expect(vaults3.length).to.equal(1);

      // Verify vaults are different addresses
      expect(vaults1[0]).to.not.equal(vaults2[0]);
      expect(vaults2[0]).to.not.equal(vaults3[0]);
      expect(vaults1[0]).to.not.equal(vaults3[0]);
    });
  });

  describe("Get Vaults By Owner", function () {
    beforeEach(async function () {
      await factory.connect(user1).createVault(0);
      await factory.connect(user1).createVault(1);
      await factory.connect(user2).createVault(2);
    });

    it("should return correct vaults for user1", async function () {
      const vaults = await factory.getVaultsByOwner(user1.address);
      expect(vaults.length).to.equal(2);
    });

    it("should return correct vaults for user2", async function () {
      const vaults = await factory.getVaultsByOwner(user2.address);
      expect(vaults.length).to.equal(1);
    });

    it("should return empty array for user with no vaults", async function () {
      const vaults = await factory.getVaultsByOwner(user3.address);
      expect(vaults.length).to.equal(0);
    });
  });

  describe("Total Vaults", function () {
    it("should track total vaults correctly", async function () {
      expect(await factory.totalVaults()).to.equal(0);

      await factory.connect(user1).createVault(0);
      expect(await factory.totalVaults()).to.equal(1);

      await factory.connect(user1).createVault(1);
      expect(await factory.totalVaults()).to.equal(2);

      await factory.connect(user2).createVault(2);
      expect(await factory.totalVaults()).to.equal(3);
    });
  });

  describe("All Vaults Registry", function () {
    it("should store all vaults in order", async function () {
      await factory.connect(user1).createVault(0);
      await factory.connect(user2).createVault(1);
      await factory.connect(user3).createVault(2);

      const vault0 = await factory.allVaults(0);
      const vault1 = await factory.allVaults(1);
      const vault2 = await factory.allVaults(2);

      expect(vault0).to.not.equal(ethers.ZeroAddress);
      expect(vault1).to.not.equal(ethers.ZeroAddress);
      expect(vault2).to.not.equal(ethers.ZeroAddress);

      // Verify they're different
      expect(vault0).to.not.equal(vault1);
      expect(vault1).to.not.equal(vault2);
    });
  });

  describe("Vault Ownership", function () {
    it("should set correct owner for created vault", async function () {
      await factory.connect(user1).createVault(1);

      const vaults = await factory.getVaultsByOwner(user1.address);
      const strategy = await ethers.getContractAt("LeverageStrategy", vaults[0]);

      expect(await strategy.owner()).to.equal(user1.address);
    });

    it("should only allow vault owner to perform owner actions", async function () {
      await factory.connect(user1).createVault(1);

      const vaults = await factory.getVaultsByOwner(user1.address);
      const strategy = await ethers.getContractAt("LeverageStrategy", vaults[0]);

      // Mint vBTC to user2
      await vbtc.mint(user2.address, toInt(5));
      await vbtc.connect(user2).approve(vaults[0], toInt(5));

      // User2 should not be able to deposit to user1's vault
      await expect(
        strategy.connect(user2).deposit(toInt(1))
      ).to.be.revertedWith("ONLY_OWNER");
    });
  });

  describe("Vault Configuration", function () {
    it("should configure vault with correct dependencies", async function () {
      await factory.connect(user1).createVault(1);

      const vaults = await factory.getVaultsByOwner(user1.address);
      const strategy = await ethers.getContractAt("LeverageStrategy", vaults[0]);

      expect(await strategy.vaultBTC()).to.equal(await vbtc.getAddress());
      expect(await strategy.aave()).to.equal(await aave.getAddress());
      expect(await strategy.oracle()).to.equal(await oracle.getAddress());
    });

    it("should set correct risk tier configuration", async function () {
      // Create Low risk vault
      await factory.connect(user1).createVault(0);
      const vaults = await factory.getVaultsByOwner(user1.address);
      const strategy = await ethers.getContractAt("LeverageStrategy", vaults[0]);

      const config = await strategy.riskCfg(0); // Low risk
      expect(config.maxBps).to.equal(11000n); // 1.1x
      expect(config.stepBps).to.equal(500n);  // 0.05x
    });
  });

  describe("Gas Optimization", function () {
    it("should create vault with reasonable gas cost", async function () {
      const tx = await factory.connect(user1).createVault(1);
      const receipt = await tx.wait();

      // Vault creation should be reasonably efficient
      expect(receipt?.gasUsed).to.be.lt(5000000n); // Less than 5M gas
    });
  });
});
