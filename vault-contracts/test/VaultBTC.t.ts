import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { VaultBTC } from "../typechain-types";

describe("VaultBTC Faucet", function () {
  let vbtc: VaultBTC;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const FAUCET_AMOUNT = BigInt(10 * 1e8); // 10 vBTC

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const VaultBTC = await ethers.getContractFactory("VaultBTC");
    vbtc = await VaultBTC.deploy();
    await vbtc.waitForDeployment();
  });

  describe("Faucet", function () {
    it("should allow user to request 10 vBTC from faucet", async function () {
      const balanceBefore = await vbtc.balanceOf(user1.address);
      
      await vbtc.connect(user1).requestFaucet();
      
      const balanceAfter = await vbtc.balanceOf(user1.address);
      expect(balanceAfter - balanceBefore).to.equal(FAUCET_AMOUNT);
    });

    it("should emit FaucetRequested event", async function () {
      await expect(vbtc.connect(user1).requestFaucet())
        .to.emit(vbtc, "FaucetRequested")
        .withArgs(user1.address, FAUCET_AMOUNT);
    });

    it("should not allow requesting twice within 24 hours", async function () {
      await vbtc.connect(user1).requestFaucet();
      
      await expect(
        vbtc.connect(user1).requestFaucet()
      ).to.be.revertedWith("FAUCET_COOLDOWN");
    });

    it("should allow requesting after 24 hours", async function () {
      await vbtc.connect(user1).requestFaucet();
      
      // Fast forward 24 hours
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      
      // Should work now
      await expect(vbtc.connect(user1).requestFaucet()).to.not.be.reverted;
    });

    it("should allow multiple users to request independently", async function () {
      await vbtc.connect(user1).requestFaucet();
      await vbtc.connect(user2).requestFaucet();
      
      const balance1 = await vbtc.balanceOf(user1.address);
      const balance2 = await vbtc.balanceOf(user2.address);
      
      expect(balance1).to.equal(FAUCET_AMOUNT);
      expect(balance2).to.equal(FAUCET_AMOUNT);
    });

    it("should correctly report canRequestFaucet status", async function () {
      // Before first request
      let [canRequest, timeLeft] = await vbtc.canRequestFaucet(user1.address);
      expect(canRequest).to.be.true;
      expect(timeLeft).to.equal(0);
      
      // After first request
      await vbtc.connect(user1).requestFaucet();
      [canRequest, timeLeft] = await vbtc.canRequestFaucet(user1.address);
      expect(canRequest).to.be.false;
      expect(timeLeft).to.be.gt(0);
      
      // After 24 hours
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      [canRequest, timeLeft] = await vbtc.canRequestFaucet(user1.address);
      expect(canRequest).to.be.true;
      expect(timeLeft).to.equal(0);
    });

    it("should increase total supply when faucet is used", async function () {
      const supplyBefore = await vbtc.totalSupply();
      
      await vbtc.connect(user1).requestFaucet();
      await vbtc.connect(user2).requestFaucet();
      
      const supplyAfter = await vbtc.totalSupply();
      expect(supplyAfter - supplyBefore).to.equal(FAUCET_AMOUNT * 2n);
    });
  });
});
