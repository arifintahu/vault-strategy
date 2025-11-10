---
inclusion: always
---

# Product Overview

**Vault Strategy** - A DeFi protocol that provides automated, rule-based leverage management for Bitcoin holders with self-custody guarantees.

## Problem Statement

BTC holders want delta exposure with smoother drawdowns and automated profit-taking, **without giving up self-custody**. Existing leverage tools are manual, centralized, or depend on wrapped BTC.

## Core Concept

Users create their own isolated LeverageStrategy vault via a factory contract. Each vault:
- Accepts user deposits as vault balance (not immediately used as collateral)
- Supplies vault balance to Aave lending platform to earn yield
- Monitors EMA signals (20-day, 50-day, 200-day) for market trends
- Automatically adjusts leverage based on bullish/bearish EMA signals
- On bullish signals: borrows stablecoin, buys BTC, increases leverage
- On bearish signals: sells BTC, repays debt, decreases leverage
- Maintains target leverage between 1.0x and 1.5x based on user's risk tier
- Tracks average BTC purchase price for portfolio management

## Key Features

- **Per-User Vaults**: Each user owns their own strategy contract (factory pattern)
- **Vault Balance Separation**: Deposits stay as vault balance, system manages collateral separately
- **Risk Tiers**: Low (1.1x max), Medium (1.3x max), High (1.5x max)
- **EMA-Based Signals**: Uses 20/50/200-day EMAs for bullish/bearish trend detection
- **Automated Rebalancing**: System can trigger leverage/deleverage, but only owner can withdraw
- **Aave Integration**: Supplies BTC to earn yield, borrows stablecoin for leverage
- **Portfolio Tracking**: Tracks average BTC purchase price and position metrics
- **Self-Custody Compatible**: Designed to work with Bitcoin trustless vaults (BitVM3)

## Leverage Mechanism

1. User deposits vaultBTC to their strategy vault (stays as vault balance)
2. User calls `supplyToAave()` to lend balance and earn yield
3. System monitors EMA signals (20-day, 50-day, 200-day)
4. **On bullish signal** (price above EMAs):
   - Vault borrows stablecoin (USDC/DAI) against collateral
   - Simulates buying vaultBTC with borrowed funds
   - Increases BTC position and leverage
   - Tracks average purchase price
5. **On bearish signal** (price below EMAs):
   - Simulates selling vaultBTC for stablecoin
   - Repays borrowed debt
   - Decreases leverage back toward 1.0x
6. User can withdraw free balance (not supplied to Aave) anytime

## Current Status

This is a **demo implementation** on Ethereum using Hardhat. It uses:
- **MockAave**: Simplified lending pool with supply/borrow/repay
- **OracleEMA**: Owner-updatable oracle with 20/50/200-day EMAs
- **Simulated swaps**: BTC purchases/sales are simulated (no real DEX)
- Simplified accounting without production safety features

## Novelty

- **EMA-based auto-leverage** using 20/50/200-day EMAs for trend detection (pluggable to smarter agents later)
- **Vault balance separation** keeps user deposits distinct from active collateral
- **Portfolio tracking** with average BTC purchase price for better PnL visibility
- **Self-custody forward-compatibility**: designed to work with trustless vaultBTC as soon as it's live
- **Risk-tiered 1.0–1.5x envelope** reduces liquidation risk while still enhancing returns
- **Per-user isolated vaults** via factory pattern for maximum control

## Production Requirements

Replace demo components with:
- **Oracles**: Chainlink price feeds + on-chain EMA calculation; freeze on deviation
- **Lending**: Real Aave/Spark integration (replace MockAave)
- **DEX**: Integration for stablecoin ↔ BTC swaps (Uniswap, Curve)
- **EMA Calculation**: On-chain or off-chain EMA updates with verification
- **Execution**: Adapters must enforce slippage bounds, rate limits, and keeper bonds; pausable with a timelock
- **Accounting**: Withdrawal queues & epoch-based PnL accounting; invariant checks each rebalance
- **Safety**: Health factor monitoring, liquidation protection, circuit breakers

## Porting to Bitcoin Trustless Vaults

Assume the real BTC is in a **trustless vault** and `vaultBTC` = the minted representation on the app chain:
- Users keep native BTC custody guarantees; redemptions are enforced by BitVM3 proofs on Bitcoin
- The strategy & adapters run on the app chain exactly as in Ethereum; only the token backing changes
- Bitcoin redemption is independent from the strategy logic
- Simply swap `VaultBTC` address to the real bridge token; keep oracle & adapter stack identical
