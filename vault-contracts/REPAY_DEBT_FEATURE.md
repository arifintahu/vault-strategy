# Repay Debt Feature

## Overview

The `repayDebt()` function allows users to manually repay their borrowed debt by selling BTC at the current market price.

## Function Signature

```solidity
function repayDebt(uint256 btcAmount) external onlyOwner
```

## How It Works

### 1. Smart Balance Usage
The function intelligently uses available BTC in this order:
1. **First:** Uses `vaultBalance` (idle balance)
2. **Then:** Uses `suppliedToAave` (if vault balance isn't enough)

### 2. Price Calculation
- Gets current BTC price from the oracle
- Calculates USD value: `usdReceived = (btcAmount * btcPrice) / 1e8`
- Caps repayment to actual debt amount

### 3. Automatic Withdrawal
- If using supplied balance, automatically withdraws from Aave
- Updates all accounting correctly

## Example Usage

### Scenario 1: Repay with Vault Balance Only

**Before:**
```
vaultBalance: 5 vBTC
suppliedToAave: 10 vBTC
borrowedFromAave: $100,000
BTC Price: $50,000
```

**Action:**
```solidity
repayDebt(2 vBTC)  // Sell 2 vBTC = $100,000
```

**After:**
```
vaultBalance: 3 vBTC (5 - 2)
suppliedToAave: 10 vBTC (unchanged)
borrowedFromAave: 0 (fully repaid)
```

### Scenario 2: Repay Using Both Balances

**Before:**
```
vaultBalance: 1 vBTC
suppliedToAave: 10 vBTC
borrowedFromAave: $150,000
BTC Price: $50,000
```

**Action:**
```solidity
repayDebt(3 vBTC)  // Sell 3 vBTC = $150,000
```

**After:**
```
vaultBalance: 0 vBTC (1 - 1, all used)
suppliedToAave: 8 vBTC (10 - 2, remaining 2 used)
borrowedFromAave: 0 (fully repaid)
btcPosition: 8 vBTC (reduced by 2)
```

### Scenario 3: Partial Repayment

**Before:**
```
vaultBalance: 2 vBTC
suppliedToAave: 10 vBTC
borrowedFromAave: $200,000
BTC Price: $50,000
```

**Action:**
```solidity
repayDebt(1 vBTC)  // Sell 1 vBTC = $50,000
```

**After:**
```
vaultBalance: 1 vBTC (2 - 1)
suppliedToAave: 10 vBTC (unchanged)
borrowedFromAave: $150,000 ($200,000 - $50,000)
```

## Requirements

1. **Must have debt:** `borrowedFromAave > 0`
2. **Must have BTC:** `vaultBalance + suppliedToAave >= btcAmount`
3. **Valid price:** Oracle must return a valid price

## Benefits

### For Users
- **Flexible:** Can repay any amount at any time
- **Smart:** Automatically uses idle balance first
- **Convenient:** No need to manually withdraw from Aave first

### For Risk Management
- **Deleverage:** Reduce leverage ratio manually
- **Avoid liquidation:** Repay debt before it becomes risky
- **Take profits:** Lock in gains by reducing position

## When to Use

1. **Market turns bearish** - Reduce leverage before losses mount
2. **Approaching liquidation** - Repay debt to improve health factor
3. **Take profits** - Lock in gains from BTC price increases
4. **Exit position** - Fully repay debt before withdrawing collateral

## Comparison with Automatic Rebalancing

| Feature | repayDebt() | rebalance() |
|---------|-------------|-------------|
| Trigger | Manual | Automatic (EMA signals) |
| Amount | User specified | Calculated by strategy |
| Timing | Anytime | Only on rebalance calls |
| Use case | Emergency/manual control | Normal operation |

## Frontend Integration

Add a "Repay Debt" tab in VaultActions:

```typescript
// Show when borrowedFromAave > 0
if (vault.state.borrowedFromAave > 0) {
  // Available: vaultBalance + suppliedToAave
  // Max: Calculate max BTC that can be sold
  // Action: Call repayDebt(amount)
}
```

## Error Messages

- `"ZERO"` - Amount must be greater than 0
- `"NO_DEBT"` - No debt to repay
- `"INVALID_PRICE"` - Oracle returned invalid price
- `"INSUFFICIENT_BTC"` - Not enough BTC available
- `"INSUFFICIENT_SUPPLIED"` - Not enough in supplied balance (shouldn't happen with proper checks)

## Events

Emits `SellAndRepay` event:
```solidity
event SellAndRepay(uint256 btcSold, uint256 repayAmount, uint256 price);
```

## Security Considerations

1. **Only owner** - Protected by `onlyOwner` modifier
2. **Price validation** - Checks oracle price is valid
3. **Balance checks** - Ensures sufficient BTC available
4. **Debt cap** - Cannot repay more than actual debt
5. **Atomic operation** - All updates happen in single transaction
