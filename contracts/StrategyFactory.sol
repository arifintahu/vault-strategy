// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./LeverageStrategy.sol";
import "./MockAave.sol";

/**
 * @title StrategyFactory
 * @notice Factory contract for creating isolated per-user LeverageStrategy vaults.
 *         Each user can create their own vault with their chosen risk tier.
 */
contract StrategyFactory {
    VaultBTC public immutable vaultBTC;
    MockAave public immutable aave;
    IOracleEMA public immutable oracle;
    
    // Registry of all created vaults
    address[] public allVaults;
    mapping(address => address[]) public vaultsByOwner;
    
    event VaultCreated(address indexed owner, address indexed vault, LeverageStrategy.Risk risk, uint256 vaultIndex);
    
    constructor(VaultBTC _vbtc, MockAave _aave, IOracleEMA _oracle) {
        vaultBTC = _vbtc;
        aave = _aave;
        oracle = _oracle;
    }
    
    /**
     * @notice Create a new LeverageStrategy vault for the caller
     * @param risk The risk tier for the vault (Low, Medium, High)
     * @return vault The address of the newly created vault
     */
    function createVault(LeverageStrategy.Risk risk) external returns (address vault) {
        LeverageStrategy strategy = new LeverageStrategy(vaultBTC, aave, oracle, msg.sender, risk);
        
        vault = address(strategy);
        allVaults.push(vault);
        vaultsByOwner[msg.sender].push(vault);
        
        emit VaultCreated(msg.sender, vault, risk, allVaults.length - 1);
    }
    
    /**
     * @notice Get all vaults created by a specific owner
     * @param owner The owner address
     * @return Array of vault addresses
     */
    function getVaultsByOwner(address owner) external view returns (address[] memory) {
        return vaultsByOwner[owner];
    }
    
    /**
     * @notice Get total number of vaults created
     * @return Total vault count
     */
    function totalVaults() external view returns (uint256) {
        return allVaults.length;
    }
}
