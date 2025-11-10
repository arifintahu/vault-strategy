// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OracleEMA (demo)
 * @notice Oracle that stores BTC price and multiple EMAs (20-day, 50-day, 200-day)
 *         Provides bullish/bearish signals based on price vs EMAs
 *         In production, replace with Chainlink or robust TWAP/EMA oracle
 */
contract OracleEMA {
    address public owner;
    
    // All values use 8 decimals (USD per BTC)
    int256 public price;        // Current spot price
    int256 public ema20;        // 20-day EMA (short-term)
    int256 public ema50;        // 50-day EMA (medium-term)
    int256 public ema200;       // 200-day EMA (long-term)
    
    uint256 public lastUpdate;
    
    event Update(int256 price, int256 ema20, int256 ema50, int256 ema200, uint256 timestamp);
    
    constructor(int256 _price, int256 _ema20, int256 _ema50, int256 _ema200) {
        owner = msg.sender;
        setEMAs(_price, _ema20, _ema50, _ema200);
    }
    
    /**
     * @notice Update price and EMAs (owner only for demo)
     */
    function setEMAs(int256 _price, int256 _ema20, int256 _ema50, int256 _ema200) public {
        require(msg.sender == owner, "ONLY_OWNER");
        require(_price > 0 && _ema20 > 0 && _ema50 > 0 && _ema200 > 0, "INVALID_PRICE");
        
        price = _price;
        ema20 = _ema20;
        ema50 = _ema50;
        ema200 = _ema200;
        lastUpdate = block.timestamp;
        
        emit Update(price, ema20, ema50, ema200, lastUpdate);
    }
    
    /**
     * @notice Get current price and EMAs
     */
    function get() external view returns (
        int256 _price,
        int256 _ema20,
        int256 _ema50,
        int256 _ema200
    ) {
        return (price, ema20, ema50, ema200);
    }
    
    /**
     * @notice Get market signal based on price vs EMAs
     * @return signal Market signal: 2=strong bullish, 1=bullish, 0=neutral, -1=bearish, -2=strong bearish
     */
    function getSignal() external view returns (int8 signal) {
        // Strong bullish: price above all EMAs
        if (price > ema20 && price > ema50 && price > ema200) {
            return 2;
        }
        // Bullish: price above 20 and 50 EMA
        else if (price > ema20 && price > ema50) {
            return 1;
        }
        // Strong bearish: price below all EMAs
        else if (price < ema20 && price < ema50 && price < ema200) {
            return -2;
        }
        // Bearish: price below 20 and 50 EMA
        else if (price < ema20 && price < ema50) {
            return -1;
        }
        // Neutral: mixed signals
        else {
            return 0;
        }
    }
    
    /**
     * @notice Check if price is above key EMAs (bullish)
     */
    function isBullish() external view returns (bool) {
        return price > ema20 && price > ema50;
    }
    
    /**
     * @notice Check if price is below key EMAs (bearish)
     */
    function isBearish() external view returns (bool) {
        return price < ema20 && price < ema50;
    }
}
