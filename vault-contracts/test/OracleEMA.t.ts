import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { OracleEMA } from "../typechain-types";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

describe("OracleEMA", function () {
  let oracle: OracleEMA;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("OracleEMA");
    oracle = await Oracle.deploy(
      toInt(60000),  // price
      toInt(59000),  // ema20
      toInt(58000),  // ema50
      toInt(55000)   // ema200
    );
    await oracle.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set initial values correctly", async function () {
      const [price, ema20, ema50, ema200] = await oracle.get();
      expect(price).to.equal(toInt(60000));
      expect(ema20).to.equal(toInt(59000));
      expect(ema50).to.equal(toInt(58000));
      expect(ema200).to.equal(toInt(55000));
    });

    it("should set owner correctly", async function () {
      expect(await oracle.owner()).to.equal(owner.address);
    });

    it("should set lastUpdate timestamp", async function () {
      const lastUpdate = await oracle.lastUpdate();
      expect(lastUpdate).to.be.gt(0);
    });
  });

  describe("Update EMAs", function () {
    it("should allow owner to update EMAs", async function () {
      await oracle.setEMAs(
        toInt(65000),
        toInt(63000),
        toInt(61000),
        toInt(58000)
      );

      const [price, ema20, ema50, ema200] = await oracle.get();
      expect(price).to.equal(toInt(65000));
      expect(ema20).to.equal(toInt(63000));
      expect(ema50).to.equal(toInt(61000));
      expect(ema200).to.equal(toInt(58000));
    });

    it("should emit Update event", async function () {
      const newPrice = toInt(65000);
      const newEma20 = toInt(63000);
      const newEma50 = toInt(61000);
      const newEma200 = toInt(58000);

      const tx = await oracle.setEMAs(newPrice, newEma20, newEma50, newEma200);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(oracle, "Update")
        .withArgs(newPrice, newEma20, newEma50, newEma200, block!.timestamp);
    });

    it("should update lastUpdate timestamp", async function () {
      const beforeUpdate = await oracle.lastUpdate();
      
      await ethers.provider.send("evm_increaseTime", [100]);
      await ethers.provider.send("evm_mine", []);
      
      await oracle.setEMAs(toInt(65000), toInt(63000), toInt(61000), toInt(58000));
      
      const afterUpdate = await oracle.lastUpdate();
      expect(afterUpdate).to.be.gt(beforeUpdate);
    });

    it("should revert if not owner", async function () {
      await expect(
        oracle.connect(user1).setEMAs(toInt(65000), toInt(63000), toInt(61000), toInt(58000))
      ).to.be.revertedWith("ONLY_OWNER");
    });

    it("should revert if price is zero or negative", async function () {
      await expect(
        oracle.setEMAs(0, toInt(63000), toInt(61000), toInt(58000))
      ).to.be.revertedWith("INVALID_PRICE");

      await expect(
        oracle.setEMAs(-1, toInt(63000), toInt(61000), toInt(58000))
      ).to.be.revertedWith("INVALID_PRICE");
    });

    it("should revert if any EMA is zero or negative", async function () {
      await expect(
        oracle.setEMAs(toInt(65000), 0, toInt(61000), toInt(58000))
      ).to.be.revertedWith("INVALID_PRICE");

      await expect(
        oracle.setEMAs(toInt(65000), toInt(63000), -1, toInt(58000))
      ).to.be.revertedWith("INVALID_PRICE");
    });
  });

  describe("Signal Detection", function () {
    it("should return strong bullish signal when price above all EMAs", async function () {
      // price=60k, ema20=59k, ema50=58k, ema200=55k
      const signal = await oracle.getSignal();
      expect(signal).to.equal(2);
    });

    it("should return bullish signal when price above 20 and 50 EMAs", async function () {
      await oracle.setEMAs(
        toInt(59000),  // price
        toInt(58000),  // ema20
        toInt(57000),  // ema50
        toInt(60000)   // ema200 (price below this)
      );

      const signal = await oracle.getSignal();
      expect(signal).to.equal(1);
    });

    it("should return neutral signal for mixed conditions", async function () {
      await oracle.setEMAs(
        toInt(58000),  // price
        toInt(59000),  // ema20 (price below)
        toInt(57000),  // ema50 (price above)
        toInt(56000)   // ema200 (price above)
      );

      const signal = await oracle.getSignal();
      expect(signal).to.equal(0);
    });

    it("should return bearish signal when price below 20 and 50 EMAs", async function () {
      await oracle.setEMAs(
        toInt(56000),  // price
        toInt(58000),  // ema20
        toInt(59000),  // ema50
        toInt(55000)   // ema200 (price above this)
      );

      const signal = await oracle.getSignal();
      expect(signal).to.equal(-1);
    });

    it("should return strong bearish signal when price below all EMAs", async function () {
      await oracle.setEMAs(
        toInt(50000),  // price
        toInt(55000),  // ema20
        toInt(58000),  // ema50
        toInt(60000)   // ema200
      );

      const signal = await oracle.getSignal();
      expect(signal).to.equal(-2);
    });
  });

  describe("Bullish/Bearish Helpers", function () {
    it("should return true for isBullish when price above 20 and 50 EMAs", async function () {
      // Default setup: price=60k, ema20=59k, ema50=58k
      expect(await oracle.isBullish()).to.be.true;
    });

    it("should return false for isBullish when price below EMAs", async function () {
      await oracle.setEMAs(
        toInt(50000),
        toInt(55000),
        toInt(58000),
        toInt(60000)
      );

      expect(await oracle.isBullish()).to.be.false;
    });

    it("should return true for isBearish when price below 20 and 50 EMAs", async function () {
      await oracle.setEMAs(
        toInt(50000),
        toInt(55000),
        toInt(58000),
        toInt(60000)
      );

      expect(await oracle.isBearish()).to.be.true;
    });

    it("should return false for isBearish when price above EMAs", async function () {
      // Default setup: price=60k, ema20=59k, ema50=58k
      expect(await oracle.isBearish()).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("should handle price equal to EMAs", async function () {
      await oracle.setEMAs(
        toInt(60000),
        toInt(60000),
        toInt(60000),
        toInt(60000)
      );

      const signal = await oracle.getSignal();
      expect(signal).to.equal(0); // Neutral when all equal
    });

    it("should handle very large price values", async function () {
      const largePrice = toInt(1000000); // $1M per BTC
      await oracle.setEMAs(
        largePrice,
        toInt(900000),
        toInt(800000),
        toInt(700000)
      );

      const [price] = await oracle.get();
      expect(price).to.equal(largePrice);
      expect(await oracle.getSignal()).to.equal(2);
    });

    it("should handle small price differences", async function () {
      await oracle.setEMAs(
        toInt(60000.01),
        toInt(60000.00),
        toInt(59999.99),
        toInt(59999.98)
      );

      const signal = await oracle.getSignal();
      expect(signal).to.equal(2); // Still strong bullish
    });
  });
});
