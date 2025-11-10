---
inclusion: always
---

# Architecture Overview

## Factory Pattern

Users create isolated vaults via `StrategyFactory.createVault(riskTier)`:
- Each user gets their own `LeverageStrategy` contract
- Factory maintains registry of all vaults
- Vault ownership is set to the creator (`msg.sender`)

## Access Control Model

### Owner-Only Functions
- `deposit()` - Add vaultBTC collateral
- `withdraw()` - Remove vaultBTC collateral
- `setRisk()` - Change risk tier (Low/Medium/High)

### Public/System Functions
- `rebalance()` - Adjust leverage based on price bands (callable by keepers/bots)

This separation allows:
- Users maintain full control over their funds
- Automated systems can optimize leverage without withdrawal risk
- Keepers can trigger rebalances for all vaults

## Leverage Loop (Production)

### Increasing Leverage (Price Dips)
1. Supply existing vaultBTC to lending platform (Aave/Spark)
2. Borrow stablecoin (USDC/DAI) against collateral
3. Swap stablecoin → vaultBTC via DEX (Uniswap/Curve)
4. Repeat steps 1-3 until target leverage reached

### Decreasing Leverage (Price Rallies)
1. Withdraw some vaultBTC from lending platform
2. Swap vaultBTC → stablecoin via DEX
3. Repay borrowed stablecoin debt
4. Repeat until target leverage reached

### Demo Implementation
Current demo uses synthetic accounting:
- `collateral` - user's vaultBTC deposit
- `positionSize` - synthetic total position (collateral × leverage)
- `debt` - synthetic stablecoin debt
- No actual lending/DEX calls (for testing logic only)

## Risk Tiers

| Tier | Max Leverage | Step Size | Use Case |
|------|--------------|-----------|----------|
| Low | 1.1x | 0.05x | Conservative, minimal liquidation risk |
| Medium | 1.3x | 0.1x | Balanced risk/reward |
| High | 1.5x | 0.1x | Aggressive, higher returns but more risk |

## Rebalance Logic

Triggered by anyone (typically automated keepers):

```
if (price <= lowerBand):
    targetLeverage += stepSize  // up to maxLeverage
    
if (price >= upperBand):
    targetLeverage -= stepSize  // down to 1.0x
```

## Integration Points (Production)

### Lending Platform
- Interface: `ILendingPool` (Aave/Spark compatible)
- Functions: `supply()`, `borrow()`, `repay()`, `withdraw()`
- Health factor monitoring required

### DEX Router
- Interface: `IDEXRouter` (Uniswap V2/V3 compatible)
- Functions: `swapExactTokensForTokens()`
- Slippage protection required

### Oracle
- Current: `OracleBands` (demo, owner-updatable)
- Production: Chainlink price feeds + TWAP fallback
- Must include circuit breakers for price manipulation

## Safety Considerations

- Health factor must stay above liquidation threshold (e.g., > 1.5)
- Slippage bounds on all DEX swaps
- Rate limiting on rebalance frequency
- Emergency pause functionality
- Keeper bond/incentive mechanism
