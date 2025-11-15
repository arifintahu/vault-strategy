
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VaultBTC {
    string public name = "vaultBTC";
    string public symbol = "vBTC";
    uint8 public decimals = 8; // mimic BTC precision-ish (demo)
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Faucet configuration
    uint256 public constant FAUCET_AMOUNT = 10 * 10**8; // 10 vBTC
    uint256 public constant FAUCET_COOLDOWN = 24 hours;
    mapping(address => uint256) public lastFaucetRequest;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event FaucetRequested(address indexed user, uint256 amount);

    function _transfer(address from, address to, uint256 value) internal {
        require(balanceOf[from] >= value, "BAL_LOW");
        unchecked {
            balanceOf[from] -= value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 a = allowance[from][msg.sender];
        require(a >= value, "ALLOW_LOW");
        unchecked { allowance[from][msg.sender] = a - value; }
        _transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 value) external {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function burn(address from, uint256 value) external {
        require(balanceOf[from] >= value, "BAL_LOW");
        unchecked {
            balanceOf[from] -= value;
            totalSupply -= value;
        }
        emit Transfer(from, address(0), value);
    }

    /**
     * @notice Request 10 vBTC from faucet (demo only)
     * @dev Can only be called once per 24 hours per address
     */
    function requestFaucet() external {
        require(
            block.timestamp >= lastFaucetRequest[msg.sender] + FAUCET_COOLDOWN,
            "FAUCET_COOLDOWN"
        );
        
        lastFaucetRequest[msg.sender] = block.timestamp;
        totalSupply += FAUCET_AMOUNT;
        balanceOf[msg.sender] += FAUCET_AMOUNT;
        
        emit Transfer(address(0), msg.sender, FAUCET_AMOUNT);
        emit FaucetRequested(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @notice Check if user can request faucet
     * @param user Address to check
     * @return canRequest True if user can request faucet
     * @return timeUntilNext Seconds until next request (0 if can request now)
     */
    function canRequestFaucet(address user) external view returns (bool canRequest, uint256 timeUntilNext) {
        uint256 nextRequestTime = lastFaucetRequest[user] + FAUCET_COOLDOWN;
        
        if (block.timestamp >= nextRequestTime) {
            return (true, 0);
        } else {
            return (false, nextRequestTime - block.timestamp);
        }
    }
}
