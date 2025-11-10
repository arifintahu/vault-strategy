
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./VaultBTC.sol";

interface IOracleBands {
    function get() external view returns (int256 price, int256 ma, int256 upper, int256 lower);
}

/**
 * @title LeverageStrategy (demo)
 * @notice Pooled strategy that adjusts target leverage between 1.0x and [1.1x..1.5x]
 *         depending on price vs MA bands. For demo only: no external DEX/Perp calls;
 *         it tracks a synthetic position size and emits intents for adapters.
 */
contract LeverageStrategy {
    VaultBTC public immutable vaultBTC;
    IOracleBands public oracle;

    enum Risk { Low, Medium, High }

    struct Config {
        uint16 maxBps;     // 10000 = 1.0x, 15000 = 1.5x
        uint16 stepBps;    // 1000 = 0.1x step
    }

    mapping(Risk => Config) public riskCfg;

    // pooled accounting
    uint256 public totalCollateral; // in vBTC
    uint256 public positionSize;    // synthetic, in vBTC notional
    uint256 public targetLeverageBps = 10000; // starts at 1.0x

    // per-user collateral shares
    mapping(address => uint256) public collateralOf;
    Risk public risk = Risk.Medium;
    address public owner;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Rebalance(uint256 oldLevBps, uint256 newLevBps, int256 price, int256 ma, int256 upper, int256 lower);
    event RiskSet(Risk newRisk);
    event Intent(string action, uint256 newTargetLevBps); // offchain/adapter hook

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor(VaultBTC _vbtc, IOracleBands _oracle) {
        vaultBTC = _vbtc;
        oracle = _oracle;
        owner = msg.sender;
        // defaults
        riskCfg[Risk.Low]    = Config({maxBps: 11000, stepBps: 500});   // up to 1.1x, 0.05x steps
        riskCfg[Risk.Medium] = Config({maxBps: 13000, stepBps: 1000});  // up to 1.3x, 0.1x steps
        riskCfg[Risk.High]   = Config({maxBps: 15000, stepBps: 1000});  // up to 1.5x, 0.1x steps
    }

    function setRisk(Risk r) external onlyOwner {
        risk = r;
        emit RiskSet(r);
    }

    function setOracle(IOracleBands o) external onlyOwner {
        oracle = o;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "ZERO");
        // pull tokens
        require(vaultBTC.transferFrom(msg.sender, address(this), amount), "XFER_FAIL");
        collateralOf[msg.sender] += amount;
        totalCollateral += amount;

        // adjust synthetic position to maintain current target leverage
        positionSize = (totalCollateral * targetLeverageBps) / 10000;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0 && collateralOf[msg.sender] >= amount, "AMT_INV");
        collateralOf[msg.sender] -= amount;
        totalCollateral -= amount;
        // adjust synthetic position to maintain current target leverage
        if (totalCollateral == 0) {
            positionSize = 0;
        } else {
            positionSize = (totalCollateral * targetLeverageBps) / 10000;
        }
        require(vaultBTC.transfer(msg.sender, amount), "XFER_FAIL");
        emit Withdraw(msg.sender, amount);
    }

    function _clamp(uint256 x, uint256 lo, uint256 hi) internal pure returns (uint256) {
        if (x < lo) return lo;
        if (x > hi) return hi;
        return x;
    }

    /// @notice Adjust target leverage based on oracle bands:
    /// if price < lower -> increase leverage by step, up to max for risk
    /// if price > upper -> decrease leverage by step, down to 1.0x
    function rebalance() external {
        (int256 price, int256 ma, int256 upper, int256 lower) = oracle.get();
        uint256 old = targetLeverageBps;
        Config memory cfg = riskCfg[risk];

        if (price <= lower) {
            // dip: increase leverage (buy more)
            uint256 next = old + cfg.stepBps;
            targetLeverageBps = _clamp(next, 10000, cfg.maxBps);
        } else if (price >= upper) {
            // rally: take profit & deleverage
            if (old > 10000) {
                uint256 next = old > cfg.stepBps ? old - cfg.stepBps : 10000;
                targetLeverageBps = _clamp(next, 10000, cfg.maxBps);
            }
        }
        // recompute synthetic position
        positionSize = (totalCollateral * targetLeverageBps) / 10000;
        emit Rebalance(old, targetLeverageBps, price, ma, upper, lower);
        emit Intent("target-leverage-updated", targetLeverageBps);
    }

    function currentLeverageBps() external view returns (uint256) {
        if (totalCollateral == 0) return 0;
        return (positionSize * 10000) / totalCollateral;
    }
}
