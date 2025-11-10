// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./VaultBTC.sol";

/**
 * @title MockAave (demo)
 * @notice Simplified Aave-like lending pool for demonstration
 *         Supports supply (deposit), withdraw, borrow, and repay
 *         Uses simple interest calculation for demo purposes
 */
contract MockAave {
    VaultBTC public immutable vaultBTC;
    
    // Mock stablecoin balances (8 decimals to match vBTC)
    mapping(address => uint256) public stablecoinBalance;
    
    // User deposits (collateral)
    mapping(address => uint256) public supplied;
    
    // User borrows (debt)
    mapping(address => uint256) public borrowed;
    
    // Simple interest rates (in basis points, 10000 = 100%)
    uint256 public supplyAPR = 300;   // 3% APR for suppliers
    uint256 public borrowAPR = 500;   // 5% APR for borrowers
    
    // Collateral factor: 75% (can borrow up to 75% of collateral value)
    uint256 public constant COLLATERAL_FACTOR = 7500; // in bps
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80%
    
    event Supply(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    
    constructor(VaultBTC _vbtc) {
        vaultBTC = _vbtc;
    }
    
    /**
     * @notice Supply vBTC as collateral to earn interest
     * @param amount Amount of vBTC to supply
     */
    function supply(uint256 amount) external {
        require(amount > 0, "ZERO");
        require(vaultBTC.transferFrom(msg.sender, address(this), amount), "XFER_FAIL");
        
        supplied[msg.sender] += amount;
        emit Supply(msg.sender, amount);
    }
    
    /**
     * @notice Withdraw supplied vBTC collateral
     * @param amount Amount of vBTC to withdraw
     */
    function withdraw(uint256 amount) external {
        require(amount > 0 && supplied[msg.sender] >= amount, "AMT_INV");
        
        // Check health factor after withdrawal
        uint256 newSupplied = supplied[msg.sender] - amount;
        require(_isHealthy(newSupplied, borrowed[msg.sender]), "UNHEALTHY");
        
        supplied[msg.sender] = newSupplied;
        require(vaultBTC.transfer(msg.sender, amount), "XFER_FAIL");
        
        emit Withdraw(msg.sender, amount);
    }
    
    /**
     * @notice Borrow stablecoin against vBTC collateral
     * @param amount Amount of stablecoin to borrow (8 decimals)
     * @param btcPrice Current BTC price (8 decimals)
     */
    function borrow(uint256 amount, uint256 btcPrice) external {
        require(amount > 0, "ZERO");
        require(supplied[msg.sender] > 0, "NO_COLLATERAL");
        
        uint256 newBorrowed = borrowed[msg.sender] + amount;
        
        // Calculate max borrow based on collateral
        uint256 collateralValue = (supplied[msg.sender] * btcPrice) / 1e8;
        uint256 maxBorrow = (collateralValue * COLLATERAL_FACTOR) / 10000;
        
        require(newBorrowed <= maxBorrow, "BORROW_LIMIT");
        
        borrowed[msg.sender] = newBorrowed;
        stablecoinBalance[msg.sender] += amount;
        
        emit Borrow(msg.sender, amount);
    }
    
    /**
     * @notice Repay borrowed stablecoin
     * @param amount Amount of stablecoin to repay (8 decimals)
     */
    function repay(uint256 amount) external {
        require(amount > 0 && borrowed[msg.sender] >= amount, "AMT_INV");
        require(stablecoinBalance[msg.sender] >= amount, "BAL_LOW");
        
        borrowed[msg.sender] -= amount;
        stablecoinBalance[msg.sender] -= amount;
        
        emit Repay(msg.sender, amount);
    }
    
    /**
     * @notice Get user's account data
     */
    function getUserAccountData(address user) external view returns (
        uint256 totalSupplied,
        uint256 totalBorrowed,
        uint256 availableToBorrow,
        uint256 healthFactor
    ) {
        totalSupplied = supplied[user];
        totalBorrowed = borrowed[user];
        
        if (totalSupplied > 0) {
            // For simplicity, assume BTC price = 1 (caller should adjust)
            uint256 maxBorrow = (totalSupplied * COLLATERAL_FACTOR) / 10000;
            availableToBorrow = maxBorrow > totalBorrowed ? maxBorrow - totalBorrowed : 0;
            
            if (totalBorrowed > 0) {
                uint256 liquidationValue = (totalSupplied * LIQUIDATION_THRESHOLD) / 10000;
                healthFactor = (liquidationValue * 1e18) / totalBorrowed;
            } else {
                healthFactor = type(uint256).max;
            }
        }
    }
    
    /**
     * @notice Check if position is healthy
     */
    function _isHealthy(uint256 collateral, uint256 debt) internal pure returns (bool) {
        if (debt == 0) return true;
        uint256 liquidationValue = (collateral * LIQUIDATION_THRESHOLD) / 10000;
        return liquidationValue >= debt;
    }
    
    /**
     * @notice Mint stablecoin for testing (demo only)
     */
    function mintStablecoin(address to, uint256 amount) external {
        stablecoinBalance[to] += amount;
    }
}
