# New Features: Vault Accounting & Debt Management

## Overview

This document describes the new vault accounting model and debt management features added to the LeverageStrategy contract.

## Key Changes

### 1. Vault Balance vs Supplied Balance Separation

Previously, the vault didn't distinguish between idle funds and funds supplied to Aave. Now we have:

- **vaultBalance**: Idle BTC in the vault (not earning yield, but immediately withdrawable)
- **suppliedToAave**: BTC supplied to Aave as collateral (earning yield, but locked if debt exists)
- **btcPosition**: Total BTC position (vaultBalance + suppliedToAave - borrowed BTC equivalent)

### 2. New Functions

#### `withdrawFromAave(uint256 amount)`

Withdraws BTC from Aave back to vault balance.

**Requirements:**
- No debt must exist (borrowedFromAave == 0)
- Sufficient supplied balance

**Use Case:**
- Move funds from Aave back to vault for immediate withdrawal
- Reduce Aave exposure while maintaining vault position

**Example:**
```solidity
// Withdraw 5 BTC from Aave to vault balance
strategy.withdrawFromAave(5 * 1e8);

// Now can withdraw to wallet
strategy.withdraw(5 * 1e8);
```

#### `repayDebt(uint256 btcAmount)`

Repays debt by selling BTC for stablecoin.

**Requirements:**
- Debt must exist (borrowedFromAave > 0)
- Sufficient BTC available (vaultBalance + suppliedToAave >= btcAmount)

**Behavior:**
1. Uses vault balance first (preferred)
2. If vault balance insufficient, withdraws from Aave
3. Simulates selling BTC for stablecoin
4. Repays debt to Aave

**Use Case:**
- Reduce leverage manually
- Prepare for withdrawal by eliminating debt
- Risk management during market volatility

**Example:**
```solidity
// Repay debt using 2 BTC
strategy.repayDebt(2 * 1e8);

// If vault balance < 2 BTC, will use supplied balance
```

## Accounting Flow

### Deposit Flow
```
User deposits 10 BTC
  ↓
vaultBalance = 10 BTC (idle)
btcPosition = 0 BTC (no collateral yet)
```

### Supply to Aave Flow
```
Supply 8 BTC to Aave
  ↓
vaultBalance = 2 BTC (idle)
suppliedToAave = 8 BTC (earning yield)
btcPosition = 8 BTC (collateral)
```

### Rebalance (Create Leverage) Flow
```
Rebalance with bullish signal
  ↓
Borrow $60,000 USD from Aave
Buy 1 BTC with borrowed funds
Supply 1 BTC to Aave
  ↓
vaultBalance = 2 BTC
suppliedToAave = 9 BTC
borrowedFromAave = $60,000
btcPosition = 9 BTC (8 + 1 from leverage)
leverage = 1.125x (9 / 8)
```

### Repay Debt Flow
```
Repay debt with 2 BTC
  ↓
Sell 2 BTC for $120,000
Repay $60,000 debt (all debt cleared)
  ↓
vaultBalance = 0 BTC (2 - 2)
suppliedToAave = 9 BTC
borrowedFromAave = $0
btcPosition = 9 BTC
```

### Withdraw from Aave Flow
```
Withdraw 5 BTC from Aave (only possible when debt = 0)
  ↓
vaultBalance = 5 BTC
suppliedToAave = 4 BTC
btcPosition = 9 BTC (unchanged)
```

### Withdraw to Wallet Flow
```
Withdraw 5 BTC to wallet
  ↓
vaultBalance = 0 BTC
suppliedToAave = 4 BTC
btcPosition = 4 BTC (5 BTC removed from position)
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Test vault accounting
npm run test:accounting

# Test debt repayment
npm run test:repay

# Run integration test
npm run test:integration
```

### Test Coverage

All 119 tests passing:
- ✅ MockAave (35 tests)
- ✅ OracleEMA (18 tests)
- ✅ StrategyFactory (17 tests)
- ✅ VaultBTC (16 tests)
- ✅ LeverageStrategy (33 tests)
  - Vault Balance (6 tests)
  - Rebalancing (5 tests)
  - Repay Debt (4 tests)
  - Risk Tiers (2 tests)

## Integration Test

The integration test demonstrates the complete lifecycle:

```bash
npm run test:integration
```

**Test Flow:**
1. Deploy all contracts
2. Create a vault
3. Deposit 20 vBTC
4. Supply 15 vBTC to Aave
5. Rebalance to create leverage
6. Repay debt using vault balance
7. Repay more debt using supplied balance (if needed)
8. Withdraw from Aave to vault balance
9. Withdraw to wallet

## Frontend Integration

### New UI Components Needed

1. **Vault Balance Display**
   - Show vaultBalance separately from suppliedToAave
   - Indicate which funds are immediately withdrawable

2. **Repay Debt Button**
   - Only show when debt exists
   - Allow user to specify BTC amount to sell
   - Show estimated debt reduction

3. **Withdraw from Aave Button**
   - Only show when debt = 0 and suppliedToAave > 0
   - Allow user to move funds from Aave to vault balance

4. **Enhanced State Display**
   ```typescript
   interface VaultState {
     vaultBalance: bigint;      // Idle BTC
     suppliedToAave: bigint;    // BTC earning yield
     borrowedFromAave: bigint;  // USD debt
     btcPosition: bigint;       // Total BTC position
     currentLeverageBps: bigint; // Leverage in basis points
   }
   ```

### Example Frontend Code

```typescript
// Check if user can withdraw from Aave
const canWithdrawFromAave = state.borrowedFromAave === 0n && state.suppliedToAave > 0n;

// Check if user can repay debt
const canRepayDebt = state.borrowedFromAave > 0n;

// Calculate available BTC for repayment
const availableForRepay = state.vaultBalance + state.suppliedToAave;

// Repay debt
if (canRepayDebt) {
  await strategy.repayDebt(btcAmount);
}

// Withdraw from Aave
if (canWithdrawFromAave) {
  await strategy.withdrawFromAave(amount);
}
```

## Security Considerations

1. **Debt Check**: Cannot withdraw from Aave while debt exists
2. **Balance Check**: Cannot repay more than available BTC
3. **Owner Only**: All functions are owner-only (vault creator)
4. **Health Factor**: Aave enforces health factor on all operations

## Next Steps

1. ✅ Update tests (COMPLETED)
2. ✅ Create integration test (COMPLETED)
3. ✅ Update documentation (COMPLETED)
4. 🔄 Update frontend UI
5. 🔄 Add transaction history/events
6. 🔄 Add analytics dashboard

## Questions?

See also:
- [VAULT_ACCOUNTING.md](./VAULT_ACCOUNTING.md) - Detailed accounting model
- [REPAY_DEBT_FEATURE.md](./REPAY_DEBT_FEATURE.md) - Debt repayment details
- [test/VaultStrategy.t.ts](./test/VaultStrategy.t.ts) - Test examples
