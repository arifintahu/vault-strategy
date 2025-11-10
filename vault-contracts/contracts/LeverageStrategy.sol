
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./VaultBTC.sol";
import "./MockAave.sol";

interface IOracleEMA {
    function get() external view returns (int256 price, int256 ema20, int256 ema50, int256 ema200);
    function getSignal() external view returns (int8 signal);
    function isBullish() external view returns (bool);
}

/**
 * @title LeverageStrategy (demo)
 * @notice Per-user isolated vault with automated leverage management
 *         - User deposits stay as vault balance (not immediately used as collateral)
 *         - System lends vault balance to Aave to earn yield
 *         - On bullish EMA signals: borrows stablecoin, buys BTC, increases position
 *         - On bearish signals: sells BTC, repays debt, deleverages
 *         - Tracks average BTC purchase price for portfolio management
 */
contract LeverageStrategy {
    VaultBTC public immutable vaultBTC;
    MockAave public immutable aave;
    IOracleEMA public oracle;
    address public immutable owner;

    enum Risk { Low, Medium, High }

    struct Config {
        uint16 maxBps;     // 10000 = 1.0x, 15000 = 1.5x
        uint16 stepBps;    // 1000 = 0.1x step
    }

    mapping(Risk => Config) public riskCfg;

    // Vault accounting (separated from collateral)
    uint256 public vaultBalance;        // User's total balance in vault (not yet collateral)
    uint256 public suppliedToAave;      // Amount supplied to Aave as collateral
    uint256 public borrowedFromAave;    // Stablecoin debt from Aave (8 decimals)
    uint256 public btcPosition;         // Total BTC position (supplied + purchased with borrowed funds)
    
    // Portfolio tracking
    uint256 public totalBtcPurchased;   // Total BTC bought with borrowed funds
    uint256 public totalUsdSpent;       // Total USD spent on BTC purchases (8 decimals)
    uint256 public targetLeverageBps = 10000; // starts at 1.0x

    Risk public risk;

    event Deposit(address indexed owner, uint256 amount);
    event Withdraw(address indexed owner, uint256 amount);
    event SupplyToAave(uint256 amount);
    event BorrowAndBuy(uint256 borrowAmount, uint256 btcBought, uint256 price);
    event SellAndRepay(uint256 btcSold, uint256 repayAmount, uint256 price);
    event Rebalance(uint256 oldLevBps, uint256 newLevBps, int256 price, int8 signal);
    event RiskSet(Risk newRisk);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor(
        VaultBTC _vbtc,
        MockAave _aave,
        IOracleEMA _oracle,
        address _owner,
        Risk _risk
    ) {
        vaultBTC = _vbtc;
        aave = _aave;
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

    /**
     * @notice Deposit vBTC to vault (stays as vault balance, not immediately collateral)
     */
    function deposit(uint256 amount) external onlyOwner {
        require(amount > 0, "ZERO");
        require(vaultBTC.transferFrom(msg.sender, address(this), amount), "XFER_FAIL");
        vaultBalance += amount;
        emit Deposit(msg.sender, amount);
    }

    /**
     * @notice Withdraw vBTC from vault (must have sufficient free balance)
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "ZERO");
        uint256 freeBalance = vaultBalance - suppliedToAave;
        require(freeBalance >= amount, "INSUFFICIENT_FREE");
        
        vaultBalance -= amount;
        require(vaultBTC.transfer(msg.sender, amount), "XFER_FAIL");
        emit Withdraw(msg.sender, amount);
    }

    /**
     * @notice Supply vault balance to Aave to earn yield
     */
    function supplyToAave(uint256 amount) public {
        require(amount > 0, "ZERO");
        uint256 freeBalance = vaultBalance - suppliedToAave;
        require(freeBalance >= amount, "INSUFFICIENT_FREE");
        
        // Approve and supply to Aave
        vaultBTC.approve(address(aave), amount);
        aave.supply(amount);
        
        suppliedToAave += amount;
        btcPosition += amount;
        emit SupplyToAave(amount);
    }

    function _clamp(uint256 x, uint256 lo, uint256 hi) internal pure returns (uint256) {
        if (x < lo) return lo;
        if (x > hi) return hi;
        return x;
    }

    /**
     * @notice Rebalance strategy based on EMA signals
     *         Bullish: borrow stablecoin, buy BTC, increase leverage
     *         Bearish: sell BTC, repay debt, decrease leverage
     */
    function rebalance() external {
        require(suppliedToAave > 0, "NO_COLLATERAL");
        
        (int256 price, , , ) = oracle.get();
        int8 signal = oracle.getSignal();
        uint256 old = targetLeverageBps;
        Config memory cfg = riskCfg[risk];

        // Bullish signal: increase leverage
        if (signal > 0 && targetLeverageBps < cfg.maxBps) {
            uint256 next = old + cfg.stepBps;
            targetLeverageBps = _clamp(next, 10000, cfg.maxBps);
            
            // Execute: borrow and buy BTC
            _borrowAndBuy(uint256(price));
        }
        // Bearish signal: decrease leverage
        else if (signal < 0 && targetLeverageBps > 10000) {
            uint256 next = old > cfg.stepBps ? old - cfg.stepBps : 10000;
            targetLeverageBps = _clamp(next, 10000, cfg.maxBps);
            
            // Execute: sell BTC and repay debt
            _sellAndRepay(uint256(price));
        }
        
        emit Rebalance(old, targetLeverageBps, price, signal);
    }

    /**
     * @notice Borrow stablecoin from Aave and simulate buying BTC
     */
    function _borrowAndBuy(uint256 btcPrice) internal {
        // Calculate how much to borrow based on target leverage
        uint256 targetPosition = (suppliedToAave * targetLeverageBps) / 10000;
        
        if (targetPosition <= btcPosition) return;
        
        uint256 additionalBtcNeeded = targetPosition - btcPosition;
        uint256 borrowAmount = (additionalBtcNeeded * btcPrice) / 1e8;
        
        // Borrow from Aave
        aave.borrow(borrowAmount, btcPrice);
        borrowedFromAave += borrowAmount;
        
        // Simulate buying BTC with borrowed stablecoin
        btcPosition += additionalBtcNeeded;
        totalBtcPurchased += additionalBtcNeeded;
        totalUsdSpent += borrowAmount;
        
        emit BorrowAndBuy(borrowAmount, additionalBtcNeeded, btcPrice);
    }

    /**
     * @notice Sell BTC and repay debt to Aave
     */
    function _sellAndRepay(uint256 btcPrice) internal {
        if (borrowedFromAave == 0) return;
        
        // Calculate how much BTC to sell based on target leverage
        uint256 targetPosition = (suppliedToAave * targetLeverageBps) / 10000;
        
        if (targetPosition >= btcPosition) return;
        
        uint256 btcToSell = btcPosition - targetPosition;
        uint256 usdReceived = (btcToSell * btcPrice) / 1e8;
        
        // Cap repayment to actual debt
        uint256 repayAmount = usdReceived > borrowedFromAave ? borrowedFromAave : usdReceived;
        uint256 actualBtcSold = (repayAmount * 1e8) / btcPrice;
        
        // Simulate selling BTC
        btcPosition -= actualBtcSold;
        
        // Repay to Aave
        aave.repay(repayAmount);
        borrowedFromAave -= repayAmount;
        
        emit SellAndRepay(actualBtcSold, repayAmount, btcPrice);
    }

    /**
     * @notice Get current leverage in basis points
     */
    function currentLeverageBps() external view returns (uint256) {
        if (suppliedToAave == 0) return 0;
        return (btcPosition * 10000) / suppliedToAave;
    }
    
    /**
     * @notice Get average BTC purchase price
     */
    function averageBtcPrice() external view returns (uint256) {
        if (totalBtcPurchased == 0) return 0;
        return (totalUsdSpent * 1e8) / totalBtcPurchased;
    }
    
    /**
     * @notice Get vault state
     */
    function getVaultState() external view returns (
        uint256 _vaultBalance,
        uint256 _suppliedToAave,
        uint256 _borrowedFromAave,
        uint256 _btcPosition,
        uint256 _targetLeverageBps,
        uint256 _currentLeverageBps,
        uint256 _avgBtcPrice,
        Risk _risk
    ) {
        _vaultBalance = vaultBalance;
        _suppliedToAave = suppliedToAave;
        _borrowedFromAave = borrowedFromAave;
        _btcPosition = btcPosition;
        _targetLeverageBps = targetLeverageBps;
        _currentLeverageBps = suppliedToAave > 0 ? (btcPosition * 10000) / suppliedToAave : 0;
        _avgBtcPrice = totalBtcPurchased > 0 ? (totalUsdSpent * 1e8) / totalBtcPurchased : 0;
        _risk = risk;
    }
}
