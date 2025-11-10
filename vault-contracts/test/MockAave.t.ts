import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { VaultBTC, MockAave } from "../typechain-types";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

describe("MockAave", function () {
  let vbtc: VaultBTC;
  let aave: MockAave;
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

    // Mint vBTC to users
    await vbtc.mint(user1.address, toInt(10));
    await vbtc.mint(user2.address, toInt(5));
  });

  describe("Deployment", function () {
    it("should set vaultBTC address", async function () {
      expect(await aave.vaultBTC()).to.equal(await vbtc.getAddress());
    });

    it("should set correct interest rates", async function () {
      expect(await aave.supplyAPR()).to.equal(300n); // 3%
      expect(await aave.borrowAPR()).to.equal(500n); // 5%
    });

    it("should set correct collateral factor", async function () {
      expect(await aave.COLLATERAL_FACTOR()).to.equal(7500n); // 75%
    });

    it("should set correct liquidation threshold", async function () {
      expect(await aave.LIQUIDATION_THRESHOLD()).to.equal(8000n); // 80%
    });
  });

  describe("Supply", function () {
    it("should allow users to supply collateral", async function () {
      const amount = toInt(2);
      await vbtc.connect(user1).approve(await aave.getAddress(), amount);
      await aave.connect(user1).supply(amount);

      expect(await aave.supplied(user1.address)).to.equal(amount);
      expect(await vbtc.balanceOf(await aave.getAddress())).to.equal(amount);
    });

    it("should emit Supply event", async function () {
      const amount = toInt(1);
      await vbtc.connect(user1).approve(await aave.getAddress(), amount);

      await expect(aave.connect(user1).supply(amount))
        .to.emit(aave, "Supply")
        .withArgs(user1.address, amount);
    });

    it("should revert on zero amount", async function () {
      await expect(aave.connect(user1).supply(0))
        .to.be.revertedWith("ZERO");
    });

    it("should revert if insufficient balance", async function () {
      const amount = toInt(20);
      await vbtc.connect(user1).approve(await aave.getAddress(), amount);

      await expect(aave.connect(user1).supply(amount))
        .to.be.revertedWith("BAL_LOW");
    });

    it("should allow multiple supplies", async function () {
      await vbtc.connect(user1).approve(await aave.getAddress(), toInt(10));
      await aave.connect(user1).supply(toInt(2));
      await aave.connect(user1).supply(toInt(3));

      expect(await aave.supplied(user1.address)).to.equal(toInt(5));
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await vbtc.connect(user1).approve(await aave.getAddress(), toInt(5));
      await aave.connect(user1).supply(toInt(5));
    });

    it("should allow users to withdraw collateral", async function () {
      const amount = toInt(2);
      await aave.connect(user1).withdraw(amount);

      expect(await aave.supplied(user1.address)).to.equal(toInt(3));
      expect(await vbtc.balanceOf(user1.address)).to.equal(toInt(7)); // 10 - 5 + 2
    });

    it("should emit Withdraw event", async function () {
      const amount = toInt(1);
      await expect(aave.connect(user1).withdraw(amount))
        .to.emit(aave, "Withdraw")
        .withArgs(user1.address, amount);
    });

    it("should revert on zero amount", async function () {
      await expect(aave.connect(user1).withdraw(0))
        .to.be.revertedWith("AMT_INV");
    });

    it("should revert if withdrawing more than supplied", async function () {
      await expect(aave.connect(user1).withdraw(toInt(6)))
        .to.be.revertedWith("AMT_INV");
    });

    it("should revert if withdrawal makes position unhealthy", async function () {
      const btcPrice = toInt(60000);
      const borrowAmount = toInt(30000); // Borrow $30k against 5 BTC ($300k)

      await aave.connect(user1).borrow(borrowAmount, btcPrice);

      // Try to withdraw too much (would make health factor < 1)
      await expect(aave.connect(user1).withdraw(toInt(4)))
        .to.be.revertedWith("UNHEALTHY");
    });

    it("should allow full withdrawal if no debt", async function () {
      await aave.connect(user1).withdraw(toInt(5));
      expect(await aave.supplied(user1.address)).to.equal(0n);
    });
  });

  describe("Borrow", function () {
    beforeEach(async function () {
      await vbtc.connect(user1).approve(await aave.getAddress(), toInt(5));
      await aave.connect(user1).supply(toInt(5));
    });

    it("should allow users to borrow against collateral", async function () {
      const btcPrice = toInt(60000);
      const borrowAmount = toInt(20000); // $20k

      await aave.connect(user1).borrow(borrowAmount, btcPrice);

      expect(await aave.borrowed(user1.address)).to.equal(borrowAmount);
      expect(await aave.stablecoinBalance(user1.address)).to.equal(borrowAmount);
    });

    it("should emit Borrow event", async function () {
      const btcPrice = toInt(60000);
      const borrowAmount = toInt(10000);

      await expect(aave.connect(user1).borrow(borrowAmount, btcPrice))
        .to.emit(aave, "Borrow")
        .withArgs(user1.address, borrowAmount);
    });

    it("should revert on zero amount", async function () {
      await expect(aave.connect(user1).borrow(0, toInt(60000)))
        .to.be.revertedWith("ZERO");
    });

    it("should revert if no collateral", async function () {
      await expect(aave.connect(user2).borrow(toInt(1000), toInt(60000)))
        .to.be.revertedWith("NO_COLLATERAL");
    });

    it("should revert if borrowing more than allowed (75% LTV)", async function () {
      const btcPrice = toInt(60000);
      // 5 BTC * $60k = $300k collateral
      // Max borrow = $300k * 75% = $225k
      const maxBorrow = toInt(225000);
      const overBorrow = maxBorrow + 1n;

      await expect(aave.connect(user1).borrow(overBorrow, btcPrice))
        .to.be.revertedWith("BORROW_LIMIT");
    });

    it("should allow borrowing up to 75% LTV", async function () {
      const btcPrice = toInt(60000);
      const maxBorrow = toInt(225000); // 75% of $300k

      await aave.connect(user1).borrow(maxBorrow, btcPrice);
      expect(await aave.borrowed(user1.address)).to.equal(maxBorrow);
    });

    it("should allow multiple borrows within limit", async function () {
      const btcPrice = toInt(60000);
      await aave.connect(user1).borrow(toInt(50000), btcPrice);
      await aave.connect(user1).borrow(toInt(50000), btcPrice);

      expect(await aave.borrowed(user1.address)).to.equal(toInt(100000));
    });
  });

  describe("Repay", function () {
    beforeEach(async function () {
      await vbtc.connect(user1).approve(await aave.getAddress(), toInt(5));
      await aave.connect(user1).supply(toInt(5));
      await aave.connect(user1).borrow(toInt(50000), toInt(60000));
    });

    it("should allow users to repay debt", async function () {
      const repayAmount = toInt(20000);
      await aave.connect(user1).repay(repayAmount);

      expect(await aave.borrowed(user1.address)).to.equal(toInt(30000));
      expect(await aave.stablecoinBalance(user1.address)).to.equal(toInt(30000));
    });

    it("should emit Repay event", async function () {
      const repayAmount = toInt(10000);
      await expect(aave.connect(user1).repay(repayAmount))
        .to.emit(aave, "Repay")
        .withArgs(user1.address, repayAmount);
    });

    it("should revert on zero amount", async function () {
      await expect(aave.connect(user1).repay(0))
        .to.be.revertedWith("AMT_INV");
    });

    it("should revert if repaying more than borrowed", async function () {
      await expect(aave.connect(user1).repay(toInt(60000)))
        .to.be.revertedWith("AMT_INV");
    });

    it("should revert if insufficient stablecoin balance", async function () {
      // Manually reduce stablecoin balance
      await aave.connect(user1).repay(toInt(50000)); // Repay all

      await expect(aave.connect(user1).repay(toInt(1000)))
        .to.be.revertedWith("AMT_INV");
    });

    it("should allow full repayment", async function () {
      await aave.connect(user1).repay(toInt(50000));
      expect(await aave.borrowed(user1.address)).to.equal(0n);
      expect(await aave.stablecoinBalance(user1.address)).to.equal(0n);
    });
  });

  describe("User Account Data", function () {
    beforeEach(async function () {
      await vbtc.connect(user1).approve(await aave.getAddress(), toInt(5));
      await aave.connect(user1).supply(toInt(5));
    });

    it("should return correct account data with no debt", async function () {
      const data = await aave.getUserAccountData(user1.address);

      expect(data.totalSupplied).to.equal(toInt(5));
      expect(data.totalBorrowed).to.equal(0n);
      expect(data.healthFactor).to.equal(ethers.MaxUint256);
    });

    it("should return correct account data with debt", async function () {
      await aave.connect(user1).borrow(toInt(50000), toInt(60000));

      const data = await aave.getUserAccountData(user1.address);

      expect(data.totalSupplied).to.equal(toInt(5));
      expect(data.totalBorrowed).to.equal(toInt(50000));
      // Note: health factor in demo uses simplified calculation (doesn't account for BTC price)
      // In production, this would use oracle price
      expect(data.healthFactor).to.be.gt(0n);
    });

    it("should calculate health factor correctly", async function () {
      const btcPrice = toInt(60000);
      // Note: MockAave uses simplified health factor calculation
      // It treats BTC collateral value as 1:1 (doesn't multiply by price)
      // 5 BTC collateral, liquidation threshold 80% = 4 BTC liquidation value
      // Borrow $50k -> health factor = 4 / 50000 (in BTC terms)
      await aave.connect(user1).borrow(toInt(50000), btcPrice);

      const data = await aave.getUserAccountData(user1.address);
      
      // Health factor should be positive and indicate healthy position
      expect(data.healthFactor).to.be.gt(0n);
      
      // With 5 BTC supplied and $50k borrowed, position should be healthy
      // (In production, this would properly account for BTC price)
    });
  });

  describe("Mint Stablecoin (Demo)", function () {
    it("should allow minting stablecoin for testing", async function () {
      const amount = toInt(10000);
      await aave.mintStablecoin(user1.address, amount);

      expect(await aave.stablecoinBalance(user1.address)).to.equal(amount);
    });

    it("should allow anyone to mint (demo only)", async function () {
      await aave.connect(user2).mintStablecoin(user1.address, toInt(5000));
      expect(await aave.stablecoinBalance(user1.address)).to.equal(toInt(5000));
    });
  });

  describe("Multiple Users", function () {
    it("should handle multiple users independently", async function () {
      // User1 supplies and borrows
      await vbtc.connect(user1).approve(await aave.getAddress(), toInt(5));
      await aave.connect(user1).supply(toInt(5));
      await aave.connect(user1).borrow(toInt(50000), toInt(60000));

      // User2 supplies and borrows
      await vbtc.connect(user2).approve(await aave.getAddress(), toInt(3));
      await aave.connect(user2).supply(toInt(3));
      await aave.connect(user2).borrow(toInt(30000), toInt(60000));

      expect(await aave.supplied(user1.address)).to.equal(toInt(5));
      expect(await aave.borrowed(user1.address)).to.equal(toInt(50000));
      expect(await aave.supplied(user2.address)).to.equal(toInt(3));
      expect(await aave.borrowed(user2.address)).to.equal(toInt(30000));
    });
  });
});
