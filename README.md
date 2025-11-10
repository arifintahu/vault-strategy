
# Vault Strategy — Demo (Ethereum)

> Minimal, open-source demonstration for a *Bitcoin trustless vaults–ready* DeFi idea. We assume **`vaultBTC` is an ERC20** that represents users’ BTC positions. This repo shows a working demo on Ethereum (local Hardhat) with a strategy that **increases leverage on dips and takes profit by deleveraging on rallies** using simple MA bands.

## Quickstart
```bash
npm i
npm run build
npm test
npm run deploy:local
```

## Contracts
- `VaultBTC.sol`: minimal ERC20 (demo stand-in for vaultBTC).
- `OracleBands.sol`: owner-updatable spot + MA bands (demo). Replace with Chainlink/TWAP in production.
- `LeverageStrategy.sol`: pooled strategy that adjusts **target leverage** in [1.0x .. 1.5x] based on bands (risk tiers). Emits `Intent` for off-chain/adapter execution; tracks a **synthetic position** for demo purposes.

## How the demo proves feasibility
- Deterministic, on-chain rebalance rules (can be invoked trustlessly).
- Tests show leverage increases when price < lower band and decreases when price > upper band.
- Separation between **intent (target leverage)** and **execution** via adapters enables plugging into real perps/credit markets later.

## Security Considerations (demo level)
- No external protocol calls in demo (no funds at risk). Replace `OracleBands` with a robust oracle.
- Strategy uses pooled accounting; real system should include solvency checks, withdrawal queues, execution slippage bounds, keeper bonds, and circuit breakers.

## Porting to Bitcoin Trustless Vaults
- Keep `LeverageStrategy` unchanged on target app-chain.
- Replace `VaultBTC` with the real vault token (mint/burn gated by Bitcoin proof flows).
- Rebalance/withdraw flows stay the same; redemption on Bitcoin happens via the vault’s claim/challenge logic (BitVM3).

## License
MIT
