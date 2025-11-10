---
inclusion: always
---

# Product Overview

**vaultBTC Auto-Leverage Strategy** - A DeFi protocol that provides automated, rule-based leverage management for Bitcoin holders.

## Core Concept

Users create their own isolated LeverageStrategy vault via a factory contract. Each vault:
- Deposits vaultBTC to lending platform as collateral
- Borrows stablecoin against the collateral
- Swaps stablecoin to BTC to increase position (leverage)
- Automatically adjusts leverage based on price vs MA bands
- Increases leverage on dips (below MA lower band)
- Deleverages on rallies (above MA upper band)
- Maintains target leverage between 1.0x and 1.5x based on user's risk tier

## Key Features

- **Per-User Vaults**: Each user owns their own strategy contract (factory pattern)
- **Risk Tiers**: Low (1.1x max), Medium (1.3x max), High (1.5x max)
- **Automated Rebalancing**: System can trigger leverage/deleverage, but only owner can withdraw
- **Lending Integration**: Supplies BTC to lending platform, borrows stablecoin for leverage loop
- **Self-Custody Compatible**: Designed to work with Bitcoin trustless vaults (BitVM3)

## Leverage Mechanism

1. User deposits vaultBTC to their strategy vault
2. Vault supplies vaultBTC to lending platform (e.g., Aave/Spark)
3. Vault borrows stablecoin (USDC/DAI) against collateral
4. Vault swaps stablecoin to vaultBTC via DEX
5. Repeat steps 2-4 to reach target leverage
6. On deleverage: reverse the process (sell BTC → repay debt)

## Current Status

This is a **demo implementation** on Ethereum using Hardhat. It uses:
- Synthetic position tracking (no real lending/DEX calls)
- Mock oracle for price/MA bands
- Simplified accounting without production safety features

## Production Requirements

Replace demo components with:
- Chainlink/TWAP oracles with failovers
- Real lending platform integration (Aave, Spark, Compound)
- DEX integration for stablecoin ↔ BTC swaps (Uniswap, Curve)
- Slippage bounds, health factor monitoring, liquidation protection
- Keeper system for automated rebalancing
- Circuit breakers and emergency pause functionality
