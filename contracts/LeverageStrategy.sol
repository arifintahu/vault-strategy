
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./VaultBTC.sol";

interface IOracleBands {
    function get() external view returns (int256 price, int256 ma, int256 upper, int256 lower);
}

/**
 * @title LeverageStrategy (demo)
 * @notice Per-user isolated vault that adjusts target leverage between 1.0x and [1.1x..1.5x]
 *         depending on price vs MA bands. Owner controls deposits/withdrawals/risk.
 *         System can trigger rebalance for automated leverage/deleverage.
 *         For demo: tracks synthetic position; production will integrate lending + DEX.
 */
contract LeverageStrategy {
    VaultBTC public immutable vaultBTC;
    IOracleBands public oracle;
    address public immutable owner;

    enum Risk { Low, Medium, High }

    struct Config {
        uint16 maxBps;     // 10000 = 1.0x, 15000 = 1.5x
        uint16 stepBps;    // 1000 = 0.1x step
    }

    mapping(Risk => Config) public riskCfg;

    // vault accounting
    uint256 public collateral;      // in vBTC
    uint256 public debt;            // synthetic debt in stablecoin (8 decimals)
    uint256 public positionSize;    // synthetic, in vBTC notional
    uint256 public targetLeverageBps = 10000; // starts at 1.0x

    Risk public risk;

    event Deposit(address indexed owner, uint256 amount);
    event Withdraw(address indexed owner, uint256 amount);
    event Rebalance(uint256 oldLevBps, uint256 newLevBps, int256 price, int256 ma, int256 upper, int256 lower);
    event RiskSet(Risk newRisk);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor(VaultBTC _vbtc, IOracleBands _oracle, address _owner, Risk _risk) {
        vaultBTC = _vbtc;
        oracle = _oracle;
        owner = _owner;
        risk = _risk;
        // defaults
        riskCfg[Risk.Low]    = Config({maxBps: 11000, stepBps: 500});   // up to 1.1x, 0.05x steps
        riskCfg[Risk.Medium] = Config({maxBps: 13000, stepBps: 1000});  // up to 1.3x, 0.1x steps
        riskCfg[Risk.High]   = Config({maxBps: 15000, stepBps: 1000});  // up to 1.5x, 0.1x steps
    }

    function setRisk(Risk r) public onlyOwner {
        risk = r;
        emit RiskSet(r);
    }

    function deposit(uint256 amount) external onlyOwner {
        require(amount > 0, "ZERO");
        // pull tokens from owner
        require(vaultBTC.transferFrom(msg.sender, address(this), amount), "XFER_FAIL");
        collateral += amount;

        // adjust synthetic position to maintain current target leverage
        positionSize = (collateral * targetLeverageBps) / 10000;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0 && collateral >= amount, "AMT_INV");
        collateral -= amount;
        // adjust synthetic position to maintain current target leverage
        if (collateral == 0) {
            positionSize = 0;
            debt = 0;
        } else {
            positionSize = (collateral * targetLeverageBps) / 10000;
        }
        require(vaultBTC.transfer(msg.sender, amount), "XFER_FAIL");
        emit Withdraw(msg.sender, amount);
    }

    function _clamp(uint256 x, uint256 lo, uint256 hi) internal pure returns (uint256) {
        if (x < lo) return lo;
        if (x > hi) return hi;
        return x;
    }

    /// @notice Adjust target leverage based on oracle bands (callable by anyone/system)
    /// if price < lower -> increase leverage by step, up to max for risk
    /// if price > upper -> decrease leverage by step, down to 1.0x
    /// In production: this will trigger lending supply/borrow and DEX swaps
    function rebalance() external {
        (int256 price, int256 ma, int256 upper, int256 lower) = oracle.get();
        uint256 old = targetLeverageBps;
        Config memory cfg = riskCfg[risk];

        if (price <= lower) {
            // dip: increase leverage (borrow more stablecoin, swap to BTC)
            uint256 next = old + cfg.stepBps;
            targetLeverageBps = _clamp(next, 10000, cfg.maxBps);
        } else if (price >= upper) {
            // rally: take profit & deleverage (sell BTC, repay debt)
            if (old > 10000) {
                uint256 next = old > cfg.stepBps ? old - cfg.stepBps : 10000;
                targetLeverageBps = _clamp(next, 10000, cfg.maxBps);
            }
        }
        // recompute synthetic position & debt
        positionSize = (collateral * targetLeverageBps) / 10000;
        // synthetic debt = (positionSize - collateral) converted to stablecoin value
        if (positionSize > collateral) {
            debt = (positionSize - collateral) * uint256(price) / 1e8;
        } else {
            debt = 0;
        }
        emit Rebalance(old, targetLeverageBps, price, ma, upper, lower);
    }

    function currentLeverageBps() external view returns (uint256) {
        if (collateral == 0) return 0;
        return (positionSize * 10000) / collateral;
    }
    
    function getVaultState() external view returns (
        uint256 _collateral,
        uint256 _debt,
        uint256 _positionSize,
        uint256 _targetLeverageBps,
        uint256 _currentLeverageBps,
        Risk _risk
    ) {
        _collateral = collateral;
        _debt = debt;
        _positionSize = positionSize;
        _targetLeverageBps = targetLeverageBps;
        _currentLeverageBps = collateral > 0 ? (positionSize * 10000) / collateral : 0;
        _risk = risk;
    }
}
