
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OracleBands (demo)
 * @notice A trivial oracle that stores spot price and MA bands.
 *         In production, replace with Chainlink or a robust TWAP/MA oracle.
 */
contract OracleBands {
    // price with 8 decimals (USD per BTC)
    int256 public price;
    int256 public ma;
    int256 public upper;
    int256 public lower;
    address public owner;

    event Update(int256 price, int256 ma, int256 upper, int256 lower);

    constructor(int256 _price, int256 _ma, int256 _upper, int256 _lower) {
        owner = msg.sender;
        setBands(_price, _ma, _upper, _lower);
    }

    function setBands(int256 _price, int256 _ma, int256 _upper, int256 _lower) public {
        require(msg.sender == owner, "ONLY_OWNER");
        require(_lower <= _ma && _ma <= _upper, "BANDS_INV");
        price = _price;
        ma = _ma;
        upper = _upper;
        lower = _lower;
        emit Update(price, ma, upper, lower);
    }

    function get() external view returns (int256 _price, int256 _ma, int256 _upper, int256 _lower) {
        return (price, ma, upper, lower);
    }
}
