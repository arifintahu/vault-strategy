---
inclusion: always
---

# Project Structure

## Directory Layout

```
├── contracts/           # Solidity smart contracts
│   ├── VaultBTC.sol                # ERC20 token (demo stand-in for vaultBTC)
│   ├── OracleBands.sol             # Price oracle with MA bands (demo)
│   ├── LeverageStrategy.sol        # Per-user strategy vault contract
│   ├── StrategyFactory.sol         # Factory for creating user vaults
│   └── interfaces/                 # Contract interfaces
│       ├── ILendingPool.sol        # Lending platform interface (Aave/Spark)
│       └── IDEXRouter.sol          # DEX router interface (Uniswap)
├── scripts/             # Deployment scripts
│   └── deploy.js              # Local deployment script
├── test/                # Test files
│   └── Strategy.t.js          # Strategy integration tests
├── artifacts/           # Compiled contract artifacts (generated)
├── cache/               # Hardhat cache (generated)
├── node_modules/        # Dependencies (generated)
├── hardhat.config.js    # Hardhat configuration
├── package.json         # NPM dependencies and scripts
├── README.md            # Project overview and quickstart
├── ONE_PAGER.md         # Product concept and vision
├── TECH_NOTES.md        # Technical implementation notes
└── DIAGRAM.md           # Architecture diagrams (if present)
```

## Contract Architecture

### StrategyFactory.sol
- Creates isolated LeverageStrategy vaults for each user
- Tracks all deployed vaults
- Provides vault lookup by user address
- Emits `VaultCreated` events

### LeverageStrategy.sol
- Per-user isolated vault (created by factory)
- **Owner-only**: deposit, withdraw, setRisk
- **System-callable**: rebalance (automated leverage/deleverage)
- **Risk tiers**: Low/Medium/High with different max leverage and step sizes
- **Rebalance logic**: adjusts `targetLeverageBps` based on price vs bands
- **Lending integration**: supplies BTC, borrows stablecoin, swaps to BTC
- **Position tracking**: tracks collateral, debt, and current leverage

### VaultBTC.sol
- Minimal ERC20 implementation
- 8 decimal precision (BTC-style)
- Public `mint()` and `burn()` functions (demo only)
- In production: replace with real vault token from Bitcoin bridge

### OracleBands.sol
- Owner-updatable price oracle
- Stores: spot price, MA, upper band, lower band
- All values use 8 decimal precision
- In production: replace with Chainlink/TWAP oracle

## Key Patterns

### Factory Pattern
- Users create vaults via `StrategyFactory.createVault()`
- Each vault is an isolated contract owned by the user
- Factory maintains registry of all vaults

### Access Control
- **Owner-only**: deposit, withdraw, setRisk
- **Public/System**: rebalance (automated by keepers)
- Owner is set to `msg.sender` in factory deployment

### Leverage Loop
1. Supply vaultBTC to lending platform (collateral)
2. Borrow stablecoin against collateral
3. Swap stablecoin → vaultBTC via DEX
4. Repeat to reach target leverage
5. Deleverage: reverse (sell BTC → repay debt)

### Immutability
- Core addresses (vaultBTC, oracle, lending, DEX) set in constructor
- Risk tier can be changed by owner

### Event-Driven
- All state changes emit events
- `Rebalance` event logs leverage adjustments
- Factory emits `VaultCreated` for indexing

## Testing Strategy

- Integration tests in `test/Strategy.t.js`
- Tests cover full flow: deposit → rebalance on dips → rebalance on rallies
- Use helper functions for decimal conversions (`toInt`)
- Verify leverage changes match expected behavior

## Deployment

- Deploy script in `scripts/deploy.js`
- Deployment order: VaultBTC → OracleBands → StrategyFactory
- Factory constructor requires: vaultBTC, oracle, lending pool, DEX router addresses
- Users call `factory.createVault(riskTier)` to deploy their own vault
