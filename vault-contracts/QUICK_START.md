# Quick Start Guide

## Installation

```bash
cd vault-contracts
npm install
```

## Development

### Compile Contracts
```bash
npm run build
```

### Run Tests
```bash
# All tests
npm test

# Specific test suites
npm run test:accounting    # Vault balance tests
npm run test:repay         # Debt repayment tests
npm run test:integration   # Full lifecycle test
```

### Local Development

1. **Start local node** (in terminal 1):
```bash
npx hardhat node
```

2. **Deploy contracts** (in terminal 2):
```bash
npm run setup
```

3. **Query state**:
```bash
npm run query
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile contracts |
| `npm test` | Run all tests (119 tests) |
| `npm run test:integration` | Run integration test |
| `npm run setup` | Deploy to local network |
| `npm run query` | Query vault state |
| `npm run oracle:update` | Update oracle prices |

## Contract Addresses (Local)

After running `npm run setup`, you'll get:

```
VaultBTC:        0x5FbDB2315678afecb367f032d93F642f64180aa3
MockAave:        0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
OracleEMA:       0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
StrategyFactory: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

## Basic Usage

### Create a Vault

```typescript
import { ethers } from "hardhat";

const factory = await ethers.getContractAt(
  "StrategyFactory",
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
);

// Create vault with Medium risk (1.3x max leverage)
const tx = await factory.createVault(1);
const receipt = await tx.wait();

// Get vault address from event
const event = receipt.logs.find(log => 
  factory.interface.parseLog(log)?.name === "VaultCreated"
);
const vaultAddress = factory.interface.parseLog(event).args[1];
```

### Deposit & Supply

```typescript
const strategy = await ethers.getContractAt("LeverageStrategy", vaultAddress);
const vaultBTC = await ethers.getContractAt("VaultBTC", vaultBTCAddress);

// Deposit 10 BTC to vault
const amount = ethers.parseUnits("10", 8);
await vaultBTC.approve(vaultAddress, amount);
await strategy.deposit(amount);

// Supply 8 BTC to Aave (earn yield)
await strategy.supplyToAave(ethers.parseUnits("8", 8));
```

### Rebalance (Create Leverage)

```typescript
// Rebalance based on oracle signal
await strategy.rebalance();

// Check state
const state = await strategy.getVaultState();
console.log("Leverage:", Number(state._currentLeverageBps) / 100, "x");
console.log("Debt:", ethers.formatUnits(state._borrowedFromAave, 8), "USD");
```

### Repay Debt

```typescript
// Repay debt by selling 2 BTC
await strategy.repayDebt(ethers.parseUnits("2", 8));

// Check remaining debt
const state = await strategy.getVaultState();
console.log("Remaining debt:", ethers.formatUnits(state._borrowedFromAave, 8), "USD");
```

### Withdraw

```typescript
// Withdraw from Aave to vault balance (only if no debt)
await strategy.withdrawFromAave(ethers.parseUnits("5", 8));

// Withdraw to wallet
await strategy.withdraw(ethers.parseUnits("5", 8));
```

## Vault State

```typescript
const state = await strategy.getVaultState();

console.log({
  vaultBalance: ethers.formatUnits(state._vaultBalance, 8),      // Idle BTC
  suppliedToAave: ethers.formatUnits(state._suppliedToAave, 8),  // BTC in Aave
  borrowedFromAave: ethers.formatUnits(state._borrowedFromAave, 8), // USD debt
  btcPosition: ethers.formatUnits(state._btcPosition, 8),        // Total BTC
  leverage: Number(state._currentLeverageBps) / 100 + "x"
});
```

## Risk Tiers

| Tier | Max Leverage | Description |
|------|--------------|-------------|
| 0 (Low) | 1.1x | Conservative |
| 1 (Medium) | 1.3x | Balanced |
| 2 (High) | 1.5x | Aggressive |

## Oracle Signals

| Signal | Value | Condition |
|--------|-------|-----------|
| Strong Bullish | 2 | Price > all EMAs |
| Bullish | 1 | Price > EMA20 & EMA50 |
| Neutral | 0 | Mixed conditions |
| Bearish | -1 | Price < EMA20 & EMA50 |
| Strong Bearish | -2 | Price < all EMAs |

## Common Workflows

### 1. Simple Deposit & Withdraw
```typescript
// Deposit
await vaultBTC.approve(vaultAddress, amount);
await strategy.deposit(amount);

// Withdraw (only vault balance, not supplied)
await strategy.withdraw(amount);
```

### 2. Earn Yield on Aave
```typescript
// Deposit
await strategy.deposit(ethers.parseUnits("10", 8));

// Supply to Aave (earn yield)
await strategy.supplyToAave(ethers.parseUnits("10", 8));

// Later: withdraw from Aave (only if no debt)
await strategy.withdrawFromAave(ethers.parseUnits("10", 8));
await strategy.withdraw(ethers.parseUnits("10", 8));
```

### 3. Leverage Trading
```typescript
// Deposit & supply
await strategy.deposit(ethers.parseUnits("10", 8));
await strategy.supplyToAave(ethers.parseUnits("10", 8));

// Create leverage
await strategy.rebalance(); // Borrows & buys more BTC

// Monitor position
const state = await strategy.getVaultState();

// Reduce leverage
await strategy.repayDebt(ethers.parseUnits("2", 8));

// Exit position
await strategy.repayDebt(remainingBTC); // Repay all debt
await strategy.withdrawFromAave(suppliedAmount);
await strategy.withdraw(vaultBalance);
```

## Troubleshooting

### "INSUFFICIENT_BALANCE" Error
- Check vault balance: `state._vaultBalance`
- Cannot withdraw more than vault balance
- Use `withdrawFromAave()` first if funds are in Aave

### "UNHEALTHY" Error
- Cannot withdraw from Aave while debt exists
- Repay debt first: `repayDebt(amount)`
- Check debt: `state._borrowedFromAave`

### "NO_DEBT" Error
- Trying to repay when no debt exists
- Check debt before repaying: `state._borrowedFromAave > 0`

### "INSUFFICIENT_BTC" Error
- Not enough BTC to repay debt
- Check available: `state._vaultBalance + state._suppliedToAave`

## Testing

### Unit Tests
```bash
npm test
```

Expected output:
```
  119 passing (4s)
```

### Integration Test
```bash
npm run test:integration
```

Expected output:
```
✅ INTEGRATION TEST COMPLETED!

🎯 Features Tested:
  ✅ Vault creation
  ✅ Deposit to vault balance
  ✅ Supply to Aave
  ✅ Rebalancing
  ✅ Repay debt
  ✅ Withdraw from Aave
  ✅ Withdraw to wallet
```

## Next Steps

1. Read [NEW_FEATURES.md](./NEW_FEATURES.md) for detailed feature documentation
2. Read [VAULT_ACCOUNTING.md](./VAULT_ACCOUNTING.md) for accounting details
3. Check [test/VaultStrategy.t.ts](./test/VaultStrategy.t.ts) for test examples
4. Update frontend to use new features

## Support

For issues or questions:
1. Check test files for examples
2. Review documentation files
3. Run integration test to see full workflow
