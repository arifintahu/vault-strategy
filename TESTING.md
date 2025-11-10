# Testing Guide

## Overview

The Vault Strategy project has comprehensive test coverage with **113 passing tests** covering all 5 smart contracts.

## Test Structure

```
test/
├── VaultBTC.t.ts           # ERC20 token tests (21 tests)
├── OracleEMA.t.ts          # Oracle tests (24 tests)
├── MockAave.t.ts           # Lending pool tests (33 tests)
├── StrategyFactory.t.ts    # Factory tests (18 tests)
└── VaultStrategy.t.ts      # Integration tests (17 tests)
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx hardhat test test/VaultBTC.t.ts
npx hardhat test test/OracleEMA.t.ts
npx hardhat test test/MockAave.t.ts
npx hardhat test test/StrategyFactory.t.ts
npx hardhat test test/VaultStrategy.t.ts
```

### Run Tests with Gas Reporting
```bash
REPORT_GAS=true npm test
```

## Test Coverage by Contract

### VaultBTC.sol (21 tests)
- Deployment and initialization
- Minting and burning tokens
- Transfer functionality
- Approval and transferFrom
- Edge cases and error handling

### OracleEMA.sol (24 tests)
- Deployment and configuration
- EMA updates and validation
- Signal detection (bullish/bearish)
- Helper functions (isBullish, isBearish)
- Edge cases (equal values, large numbers)

### MockAave.sol (33 tests)
- Deployment and configuration
- Supply and withdraw collateral
- Borrow and repay operations
- Health factor calculations
- User account data
- Multi-user scenarios

### StrategyFactory.sol (18 tests)
- Deployment and initialization
- Vault creation (Low/Medium/High risk)
- Vault registry and tracking
- Ownership and access control
- Configuration validation

### LeverageStrategy.sol (17 tests via VaultStrategy.t.ts)
- Vault balance management
- Supply to Aave
- Rebalancing logic
- Leverage limits by risk tier
- Average price tracking
- Integration with Oracle and Aave

## Test Categories

### Unit Tests
Tests individual contract functionality in isolation:
- VaultBTC: ERC20 operations
- OracleEMA: Signal detection
- MockAave: Lending operations
- StrategyFactory: Vault creation

### Integration Tests
Tests complete system workflows:
- VaultStrategy: End-to-end leverage management
- Multi-contract interactions
- User workflows

## What's Tested

✅ **Happy Paths**: Normal operations work correctly
✅ **Edge Cases**: Boundary conditions handled properly
✅ **Access Control**: Only authorized users can perform actions
✅ **Input Validation**: Invalid inputs are rejected
✅ **Event Emissions**: All state changes emit events
✅ **State Transitions**: State updates correctly
✅ **Error Messages**: Proper revert messages
✅ **Multi-User**: Multiple users can interact independently

## Test Helpers

### toInt Helper
Converts numbers to 8-decimal precision bigint:
```typescript
const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

// Examples
toInt(60000)  // $60,000 price
toInt(5)      // 5 vBTC
toInt(1.5)    // 1.5 vBTC
```

### Common Patterns

**Deploy Contracts**
```typescript
const VaultBTC = await ethers.getContractFactory("VaultBTC");
const vbtc = await VaultBTC.deploy();
await vbtc.waitForDeployment();
```

**Get Signers**
```typescript
const [owner, user1, user2] = await ethers.getSigners();
```

**Expect Revert**
```typescript
await expect(contract.someFunction())
  .to.be.revertedWith("ERROR_MESSAGE");
```

**Expect Event**
```typescript
await expect(contract.someFunction())
  .to.emit(contract, "EventName")
  .withArgs(arg1, arg2);
```

## Writing New Tests

### Test Template
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { ContractType } from "../typechain-types";

describe("ContractName", function () {
  let contract: ContractType;
  let owner: HardhatEthersSigner;
  
  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    
    const Contract = await ethers.getContractFactory("ContractName");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });
  
  describe("Feature", function () {
    it("should do something", async function () {
      // Test logic
      expect(await contract.someFunction()).to.equal(expectedValue);
    });
  });
});
```

### Best Practices

1. **Use beforeEach**: Set up fresh state for each test
2. **Descriptive Names**: Test names should describe what they test
3. **One Assertion**: Focus each test on one thing
4. **Test Failures**: Test both success and failure cases
5. **Use Helpers**: Extract common logic to helper functions
6. **BigInt**: Use `n` suffix for bigint literals: `10000n`
7. **Await Async**: Always await async operations
8. **Type Safety**: Import types from typechain-types

## Continuous Integration

Tests should be run:
- Before committing code
- In CI/CD pipeline
- Before deploying to testnet/mainnet

## Test Results

Current status: **✅ All 113 tests passing**

```
  VaultBTC: 21 passing
  OracleEMA: 24 passing
  MockAave: 33 passing
  StrategyFactory: 18 passing
  VaultStrategy: 17 passing
  
  Total: 113 passing (3s)
```
