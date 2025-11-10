
# Project: Auto-Leverage BTC with AI Bands (Ethereum demo, Bitcoin-vaults ready)

## Problem
BTC holders want delta exposure with smoother drawdowns and automated profit-taking, **without giving up self-custody**. Existing leverage tools are manual, centralized, or depend on wrapped BTC.

## Solution
A pooled strategy where users deposit **vaultBTC (ERC20)** and select a risk tier. The contract maintains a **target leverage** that:
- **Increases on dips** (price below MA lower band).
- **Deleverages on rallies** (price above MA upper band).
Target leverage stays within **1.0x–1.5x** depending on the selected risk tier.

## How it works (today on Ethereum)
- `LeverageStrategy.sol` computes a **targetLeverage** from an oracle’s MA bands and emits an **Intent** for execution.
- Demo uses a **synthetic position** (no external protocols) to validate logic deterministically on-chain.
- In production, an adapter executes the intents on a Perp/Lending venue (Aave/Spark + Uniswap or a Perps DEX).

## Why it ports cleanly to Bitcoin Trustless Vaults
Assume the real BTC is in a **trustless vault** and `vaultBTC` = the minted representation on the app chain.
- Users keep native BTC custody guarantees; redemptions are enforced by BitVM3 proofs on Bitcoin.
- The strategy & adapters run on the app chain exactly as in Ethereum; only the token backing changes.

## Novelty
- **AI-ish, rule-based auto‑leverage** tied to MA bands (pluggable to smarter agents later).
- **Self-custody forward‑compatibility**: designed to work with trustless vaultBTC as soon as it’s live.
- **Risk-tiered 1.0–1.5x envelope** reduces liquidation risk while still enhancing returns.

## Demo Proof
- Repo: this submission (Hardhat). Run `npm test` to see leverage step changes; `npm run deploy:local` to deploy.
- Contracts: `VaultBTC`, `OracleBands`, `LeverageStrategy`.

## Security Notes (brief)
- Oracles: use Chainlink + TWAP failovers; freeze on deviation.
- Execution: adapters must enforce slippage bounds, rate limits, and keeper bonds; pausable with a timelock.
- Accounting: withdrawal queues & epoch-based PnL accounting; invariant checks each rebalance.

## Team & Contact
- Team: Miftahul Arifin (Backend/Smart Contracts), contributors welcome
- Contact: arifintahu (GitHub), email/Telegram: add here

## Impact
Improves capital efficiency for BTC holders with **self-custody-friendly** leverage, and provides a path to **native BTC** once trustless vaults are production-ready.
