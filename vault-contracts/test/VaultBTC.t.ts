import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { VaultBTC } from "../typechain-types";

const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

describe("VaultBTC", function () {
  let vbtc: VaultBTC;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const VaultBTC = await ethers.getContractFactory("VaultBTC");
    vbtc = await VaultBTC.deploy();
    await vbtc.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should have correct name and symbol", async function () {
      expect(await vbtc.name()).to.equal("vaultBTC");
      expect(await vbtc.symbol()).to.equal("vBTC");
    });

    it("should have 8 decimals", async function () {
      expect(await vbtc.decimals()).to.equal(8);
    });

    it("should start with zero total supply", async function () {
      expect(await vbtc.totalSupply()).to.equal(0n);
    });
  });

  describe("Minting", function () {
    it("should mint tokens to address", async function () {
      const amount = toInt(10);
      await vbtc.mint(user1.address, amount);

      expect(await vbtc.balanceOf(user1.address)).to.equal(amount);
      expect(await vbtc.totalSupply()).to.equal(amount);
    });

    it("should emit Transfer event on mint", async function () {
      const amount = toInt(5);
      await expect(vbtc.mint(user1.address, amount))
        .to.emit(vbtc, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, amount);
    });

    it("should allow multiple mints", async function () {
      await vbtc.mint(user1.address, toInt(5));
      await vbtc.mint(user1.address, toInt(3));

      expect(await vbtc.balanceOf(user1.address)).to.equal(toInt(8));
      expect(await vbtc.totalSupply()).to.equal(toInt(8));
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await vbtc.mint(user1.address, toInt(10));
    });

    it("should burn tokens from address", async function () {
      const burnAmount = toInt(3);
      await vbtc.burn(user1.address, burnAmount);

      expect(await vbtc.balanceOf(user1.address)).to.equal(toInt(7));
      expect(await vbtc.totalSupply()).to.equal(toInt(7));
    });

    it("should emit Transfer event on burn", async function () {
      const burnAmount = toInt(2);
      await expect(vbtc.burn(user1.address, burnAmount))
        .to.emit(vbtc, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, burnAmount);
    });

    it("should revert if burning more than balance", async function () {
      await expect(vbtc.burn(user1.address, toInt(11)))
        .to.be.revertedWith("BAL_LOW");
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      await vbtc.mint(user1.address, toInt(10));
    });

    it("should transfer tokens between addresses", async function () {
      const amount = toInt(3);
      await vbtc.connect(user1).transfer(user2.address, amount);

      expect(await vbtc.balanceOf(user1.address)).to.equal(toInt(7));
      expect(await vbtc.balanceOf(user2.address)).to.equal(amount);
    });

    it("should emit Transfer event", async function () {
      const amount = toInt(2);
      await expect(vbtc.connect(user1).transfer(user2.address, amount))
        .to.emit(vbtc, "Transfer")
        .withArgs(user1.address, user2.address, amount);
    });

    it("should revert if insufficient balance", async function () {
      await expect(vbtc.connect(user1).transfer(user2.address, toInt(11)))
        .to.be.revertedWith("BAL_LOW");
    });

    it("should allow transfer of entire balance", async function () {
      await vbtc.connect(user1).transfer(user2.address, toInt(10));
      expect(await vbtc.balanceOf(user1.address)).to.equal(0n);
      expect(await vbtc.balanceOf(user2.address)).to.equal(toInt(10));
    });
  });

  describe("Approval", function () {
    it("should approve spender", async function () {
      const amount = toInt(5);
      await vbtc.connect(user1).approve(user2.address, amount);

      expect(await vbtc.allowance(user1.address, user2.address)).to.equal(amount);
    });

    it("should emit Approval event", async function () {
      const amount = toInt(3);
      await expect(vbtc.connect(user1).approve(user2.address, amount))
        .to.emit(vbtc, "Approval")
        .withArgs(user1.address, user2.address, amount);
    });

    it("should allow updating approval", async function () {
      await vbtc.connect(user1).approve(user2.address, toInt(5));
      await vbtc.connect(user1).approve(user2.address, toInt(10));

      expect(await vbtc.allowance(user1.address, user2.address)).to.equal(toInt(10));
    });
  });

  describe("TransferFrom", function () {
    beforeEach(async function () {
      await vbtc.mint(user1.address, toInt(10));
      await vbtc.connect(user1).approve(user2.address, toInt(5));
    });

    it("should transfer tokens using allowance", async function () {
      const amount = toInt(3);
      await vbtc.connect(user2).transferFrom(user1.address, user2.address, amount);

      expect(await vbtc.balanceOf(user1.address)).to.equal(toInt(7));
      expect(await vbtc.balanceOf(user2.address)).to.equal(amount);
      expect(await vbtc.allowance(user1.address, user2.address)).to.equal(toInt(2));
    });

    it("should emit Transfer event", async function () {
      const amount = toInt(2);
      await expect(vbtc.connect(user2).transferFrom(user1.address, user2.address, amount))
        .to.emit(vbtc, "Transfer")
        .withArgs(user1.address, user2.address, amount);
    });

    it("should revert if insufficient allowance", async function () {
      await expect(vbtc.connect(user2).transferFrom(user1.address, user2.address, toInt(6)))
        .to.be.revertedWith("ALLOW_LOW");
    });

    it("should revert if insufficient balance", async function () {
      await vbtc.connect(user1).approve(user2.address, toInt(20));
      await expect(vbtc.connect(user2).transferFrom(user1.address, user2.address, toInt(11)))
        .to.be.revertedWith("BAL_LOW");
    });
  });
});
