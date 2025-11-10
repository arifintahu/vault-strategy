
# Vault Strategy — Demo (Ethereum)

> Minimal, open-source demonstration for a *Bitcoin trustless vaults–ready* DeFi idea. We assume **`vaultBTC` is an ERC20** that represents users' BTC positions. This repo shows a working demo on Ethereum (local Hardhat) with a strategy that **automatically manages leverage based on EMA signals** - increasing position on bullish trends and taking profit on bearish signals.

## Key Features

- **Vault Balance Separation**: User deposits stay as vault balance, not immediately used as collateral
- **Aave Integration**: System lends vault balance to Aave to earn yield
- **EMA-Based Signals**: Uses 20-day, 50-day, and 200-day EMAs for bullish/bearish detection
- **Automated Leverage**: Borrows stablecoin and buys BTC on bullish signals, sells and repays on bearish signals
- **Portfolio Tracking**: Tracks average BTC purchase price and position metrics
- **Risk Tiers**: Low (1.1x max), Medium (1.3x max), High (1.5x max)

## Quickstart
```bash
npm i
npm run build
npm test              # Run all 113 tests
npm run deploy:local
```

## Test Coverage
✅ **113 passing tests** covering all contracts
- VaultBTC: 21 tests
- OracleEMA: 24 tests  
- MockAave: 33 tests
- StrategyFactory: 18 tests
- LeverageStrategy: 17 integration tests

See [TESTING.md](TESTING.md) for details.

## Contracts

- `VaultBTC.sol`: Minimal ERC20 (demo stand-in for vaultBTC)
- `MockAave.sol`: Simplified Aave-like lending pool for supply, borrow, repay
- `OracleEMA.sol`: Oracle with 20/50/200-day EMAs and bullish/bearish signal detection
- `LeverageStrategy.sol`: Per-user vault with automated leverage management
- `StrategyFactory.sol`: Factory for creating isolated user vaults

## How It Works

1. **User deposits vBTC** → stays as vault balance (not collateral)
2. **System supplies to Aave** → earns yield on idle balance
3. **Oracle checks EMAs** → detects bullish/bearish signals
4. **On bullish signal** → borrows stablecoin, buys BTC, increases leverage
5. **On bearish signal** → sells BTC, repays debt, decreases leverage
6. **Tracks portfolio** → average BTC price, total position, leverage ratio

## EMA Signal Logic

- **Strong Bullish (signal=2)**: Price above all EMAs (20, 50, 200)
- **Bullish (signal=1)**: Price above 20 and 50 EMAs
- **Neutral (signal=0)**: Mixed signals
- **Bearish (signal=-1)**: Price below 20 and 50 EMAs
- **Strong Bearish (signal=-2)**: Price below all EMAs

## Scripts

Comprehensive scripts for interacting with contracts:

```bash
npm run simulate        # Full end-to-end simulation
npm run query          # Query all contract states
npm run oracle:update  # Update oracle with market data
npm run aave:supply    # Supply and borrow from Aave
```

See [SCRIPTS.md](SCRIPTS.md) for detailed documentation.

## Usage Example

```typescript
// Create a vault with Medium risk (1.3x max leverage)
await factory.createVault(1);

// Deposit vBTC to vault
await vbtc.approve(vaultAddress, amount);
await vault.deposit(amount);

// Supply to Aave to start earning yield
await vault.supplyToAave(amount);

// System automatically rebalances based on EMA signals
await vault.rebalance(); // Anyone can call

// Check vault state
const state = await vault.getVaultState();
console.log("Leverage:", state._currentLeverageBps / 100, "%");
console.log("Avg BTC Price:", state._avgBtcPrice);
```

## Security Considerations (demo level)

- Simplified Aave mock (no real lending protocol integration)
- Owner-updatable oracle (replace with Chainlink/TWAP in production)
- No slippage protection or DEX integration (simulated swaps)
- Real system needs: health factor monitoring, liquidation protection, circuit breakers

## Porting to Bitcoin Trustless Vaults

- Keep `LeverageStrategy` unchanged on target app-chain
- Replace `VaultBTC` with the real vault token (mint/burn gated by Bitcoin proof flows)
- Replace `MockAave` with real Aave/Spark integration
- Replace `OracleEMA` with Chainlink price feeds + EMA calculation
- Rebalance/withdraw flows stay the same; redemption on Bitcoin happens via the vault's claim/challenge logic (BitVM3)

## License
MIT
