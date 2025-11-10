# Vault Strategy - Smart Contracts

This directory contains the Hardhat project with all smart contracts, tests, and deployment scripts.

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run build

# Run tests (113 tests)
npm test

# Deploy to local network
npm run deploy:local

# Run simulation
npm run simulate

# Query contract states
npm run query
```

## Documentation

- [SCRIPTS.md](SCRIPTS.md) - Script documentation
- [TESTING.md](TESTING.md) - Testing guide
- [TEST_COVERAGE.md](TEST_COVERAGE.md) - Test coverage
- [SUMMARY.md](SUMMARY.md) - Project summary

## Structure

```
vault-contracts/
├── contracts/          # Smart contracts
├── scripts/           # Deployment and interaction scripts
├── test/              # Test files
├── .kiro/steering/    # Project documentation
└── typechain-types/   # Generated TypeScript types
```

## Available Scripts

- `npm run build` - Compile contracts
- `npm test` - Run all tests
- `npm run deploy:local` - Deploy to local network
- `npm run simulate` - Run full simulation
- `npm run query` - Query contract states
- `npm run oracle:update` - Update oracle data
- `npm run aave:supply` - Supply to Aave

## Contracts

- **VaultBTC.sol** - ERC20 token (8 decimals)
- **MockAave.sol** - Lending pool
- **OracleEMA.sol** - EMA oracle
- **LeverageStrategy.sol** - Per-user vault
- **StrategyFactory.sol** - Vault factory

## Testing

All 113 tests passing:
- VaultBTC: 21 tests
- OracleEMA: 24 tests
- MockAave: 33 tests
- StrategyFactory: 18 tests
- VaultStrategy: 17 tests
