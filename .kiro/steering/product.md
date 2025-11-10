---
inclusion: always
---

# Product Overview

**vaultBTC Auto-Leverage Strategy** - A DeFi protocol that provides automated, rule-based leverage management for Bitcoin holders with self-custody guarantees.

## Problem Statement

BTC holders want delta exposure with smoother drawdowns and automated profit-taking, **without giving up self-custody**. Existing leverage tools are manual, centralized, or depend on wrapped BTC.

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

## Novelty

- **AI-ish, rule-based auto-leverage** tied to MA bands (pluggable to smarter agents later)
- **Self-custody forward-compatibility**: designed to work with trustless vaultBTC as soon as it's live
- **Risk-tiered 1.0–1.5x envelope** reduces liquidation risk while still enhancing returns
- **Per-user isolated vaults** via factory pattern for maximum control

## Production Requirements

Replace demo components with:
- **Oracles**: Chainlink + TWAP failovers; freeze on deviation
- **Lending**: Real lending platform integration (Aave, Spark, Compound)
- **DEX**: Integration for stablecoin ↔ BTC swaps (Uniswap, Curve)
- **Execution**: Adapters must enforce slippage bounds, rate limits, and keeper bonds; pausable with a timelock
- **Accounting**: Withdrawal queues & epoch-based PnL accounting; invariant checks each rebalance
- **Safety**: Health factor monitoring, liquidation protection, circuit breakers

## Porting to Bitcoin Trustless Vaults

Assume the real BTC is in a **trustless vault** and `vaultBTC` = the minted representation on the app chain:
- Users keep native BTC custody guarantees; redemptions are enforced by BitVM3 proofs on Bitcoin
- The strategy & adapters run on the app chain exactly as in Ethereum; only the token backing changes
- Bitcoin redemption is independent from the strategy logic
- Simply swap `VaultBTC` address to the real bridge token; keep oracle & adapter stack identical
