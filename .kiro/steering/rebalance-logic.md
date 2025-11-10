---
inclusion: always
---

# Rebalance Logic

## Core Algorithm

The strategy compares spot price to MA bands and adjusts target leverage accordingly:

```
if (price <= lowerBand):
    targetLeverage += stepSize  // up to maxLeverage for risk tier
    
if (price >= upperBand):
    targetLeverage -= stepSize  // down to 1.0x
```

## Risk Tier Parameters

| Risk Tier | Max Leverage | Step Size | Use Case |
|-----------|--------------|-----------|----------|
| Low | 1.1x (11000 bps) | 0.05x (500 bps) | Conservative, minimal liquidation risk |
| Medium | 1.3x (13000 bps) | 0.1x (1000 bps) | Balanced risk/reward |
| High | 1.5x (15000 bps) | 0.1x (1000 bps) | Aggressive, higher returns but more risk |

## Execution Flow

### Demo (Current)
1. `rebalance()` called by keeper/system
2. Oracle provides: price, MA, upper band, lower band
3. Strategy calculates new `targetLeverageBps`
4. Updates synthetic `positionSize` and `debt`
5. Emits `Rebalance` event

### Production (Future)
1. `rebalance()` called by keeper/system
2. Oracle provides: price, MA, upper band, lower band
3. Strategy calculates new `targetLeverageBps`
4. Adapter module executes the leverage change:
   - **Increase leverage**: Supply BTC → Borrow stablecoin → Swap to BTC → Repeat
   - **Decrease leverage**: Withdraw BTC → Swap to stablecoin → Repay debt → Repeat
5. Adapter reports fill data for PnL tracking
6. Emits `Rebalance` event with execution details

## Intent-Based Architecture

The strategy only sets **intent** (target leverage). A separate adapter module (off-chain keeper or on-chain bot) executes on DEX/Lending venues and reports fills.

This separation allows:
- Strategy logic remains simple and auditable
- Adapters can be upgraded without touching core strategy
- Multiple execution venues can be supported
- Slippage protection and execution optimization at adapter level

## Extending to Real Protocols

Add `IAdapter.executeTargetLeverage(targetBps)`:
- Adapter computes required delta (buy/sell amounts)
- Enforces slippage bounds and rate limits
- Submits trades to lending platform and DEX
- Stores fill data for PnL accounting
- Returns execution summary to strategy

## Safety Checks

Before rebalancing:
- Verify oracle data is fresh (timestamp check)
- Ensure price deviation is within acceptable bounds
- Check health factor will remain above threshold
- Validate gas costs don't exceed expected range
- Confirm keeper has proper authorization
