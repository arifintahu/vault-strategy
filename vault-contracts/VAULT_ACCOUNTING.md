# Vault Accounting Model

## Overview

The LeverageStrategy contract uses a clear separation between idle vault balance and supplied collateral.

## Balance Types

### 1. Vault Balance (`vaultBalance`)
- **What it is:** Idle vBTC sitting in the vault
- **Earning yield:** ❌ No
- **Can withdraw:** ✅ Yes, anytime
- **Can supply to Aave:** ✅ Yes

### 2. Supplied to Aave (`suppliedToAave`)
- **What it is:** vBTC supplied to Aave as collateral
- **Earning yield:** ✅ Yes (Aave lending APY)
- **Can withdraw:** ❌ Not directly (must withdraw from Aave first)
- **Used for:** Collateral for borrowing

## User Flow

### Deposit Flow
```
User Wallet → deposit() → vaultBalance (idle)
```

### Supply to Aave Flow
```
vaultBalance → supplyToAave() → suppliedToAave (earning yield)
```

### Withdraw Flow (Option 1: From Vault Balance)
```
vaultBalance → withdraw() → User Wallet
```

### Withdraw Flow (Option 2: From Aave)
```
suppliedToAave → withdrawFromAave() → vaultBalance → withdraw() → User Wallet
```

## Key Functions

### `deposit(amount)`
- Transfers vBTC from user to vault
- Increases `vaultBalance`
- Does NOT supply to Aave automatically

### `supplyToAave(amount)`
- Moves vBTC from `vaultBalance` to Aave
- Decreases `vaultBalance`
- Increases `suppliedToAave`
- Increases `btcPosition`

### `withdraw(amount)`
- Withdraws from `vaultBalance` only
- Requires sufficient `vaultBalance`
- Transfers vBTC back to user

### `withdrawFromAave(amount)`
- Withdraws from Aave back to vault
- Requires no outstanding debt (`borrowedFromAave == 0`)
- Decreases `suppliedToAave`
- Increases `vaultBalance`
- Decreases `btcPosition`

### `repayDebt(btcAmount)`
- Sells BTC to repay debt
- Uses `vaultBalance` first, then `suppliedToAave` if needed
- Gets current BTC price from oracle
- Calculates USD received and repays debt
- Automatically withdraws from Aave if using supplied balance

## Accounting Rules

### ✅ Correct Accounting

**Total User Assets = vaultBalance + suppliedToAave**

When supplying to Aave:
```solidity
vaultBalance -= amount;      // Remove from idle
suppliedToAave += amount;    // Add to Aave
// Total remains the same ✓
```

### ❌ Previous Incorrect Accounting

Before the fix, `vaultBalance` was NOT reduced when supplying to Aave, causing double-counting:
```solidity
// OLD (WRONG):
suppliedToAave += amount;    // Added to Aave
// vaultBalance unchanged     // Still counted in vault
// Total increased incorrectly! ✗
```

## Example Scenario

### Step 1: Deposit 10 vBTC
```
vaultBalance: 10 vBTC
suppliedToAave: 0 vBTC
Total: 10 vBTC ✓
```

### Step 2: Supply 8 vBTC to Aave
```
vaultBalance: 2 vBTC (10 - 8)
suppliedToAave: 8 vBTC
Total: 10 vBTC ✓
```

### Step 3: Withdraw 2 vBTC
```
vaultBalance: 0 vBTC (2 - 2)
suppliedToAave: 8 vBTC
Total: 8 vBTC ✓
```

### Step 4: Try to withdraw 1 more vBTC
```
❌ FAILS: "INSUFFICIENT_VAULT_BALANCE"
Must withdrawFromAave() first
```

### Step 5: Withdraw 3 vBTC from Aave
```
vaultBalance: 3 vBTC (0 + 3)
suppliedToAave: 5 vBTC (8 - 3)
Total: 8 vBTC ✓
```

### Step 6: Now can withdraw 3 vBTC
```
vaultBalance: 0 vBTC (3 - 3)
suppliedToAave: 5 vBTC
Total: 5 vBTC ✓
```

## Frontend Display

The frontend should show:

**Deposit Tab:**
- Available: User's wallet vBTC balance
- Max: User's wallet vBTC balance

**Supply to Aave Tab:**
- Available: `vaultBalance` (idle balance)
- Max: `vaultBalance`

**Withdraw Tab:**
- Available: `vaultBalance` (idle balance)
- Max: `vaultBalance`

**Withdraw from Aave Tab (if added):**
- Available: `suppliedToAave`
- Max: `suppliedToAave` (only if no debt)

## Repaying Debt Example

### Scenario: User has debt and wants to repay

**Current State:**
```
vaultBalance: 2 vBTC
suppliedToAave: 8 vBTC
borrowedFromAave: $30,000
BTC Price: $50,000
```

### Option 1: Repay using 0.5 vBTC (uses vault balance first)
```solidity
repayDebt(0.5 vBTC)
```

**Result:**
```
vaultBalance: 1.5 vBTC (2 - 0.5)
suppliedToAave: 8 vBTC (unchanged)
borrowedFromAave: $5,000 ($30,000 - $25,000)
```

### Option 2: Repay using 3 vBTC (uses vault + supplied)
```solidity
repayDebt(3 vBTC)
```

**Result:**
```
vaultBalance: 0 vBTC (2 - 2, all used)
suppliedToAave: 7 vBTC (8 - 1, remaining 1 vBTC used)
borrowedFromAave: 0 (fully repaid)
btcPosition: 7 vBTC (reduced by 1)
```

## Important Notes

1. **Cannot withdraw directly from Aave** - Must call `withdrawFromAave()` first to move funds back to `vaultBalance`

2. **Cannot withdraw from Aave with debt** - Must repay all borrowed funds before withdrawing collateral

3. **Vault balance is idle** - It doesn't earn yield until supplied to Aave

4. **Supplied balance earns yield** - But is locked as collateral if there's debt

5. **Repay debt uses vault first** - `repayDebt()` prioritizes using idle `vaultBalance` before touching `suppliedToAave`

## Migration Note

If you have existing deployed contracts with the old accounting, you'll need to:
1. Redeploy the contracts with the fixed accounting
2. Users will need to recreate their vaults
3. Or create a migration function to fix the accounting (complex)
