# Vault Strategy - Smart Contracts

This directory contains the Hardhat project with all smart contracts, tests, and deployment scripts.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run build

# Run all tests (119 tests)
npm test

# Run integration test
npm run test:integration

# Deploy to local network
npm run setup
```

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** - Developer quick start guide
- **[NEW_FEATURES.md](NEW_FEATURES.md)** - Latest features (v0.2.0)
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

### Technical Details
- **[VAULT_ACCOUNTING.md](VAULT_ACCOUNTING.md)** - Accounting model
- **[REPAY_DEBT_FEATURE.md](REPAY_DEBT_FEATURE.md)** - Debt management
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation details

### Legacy Docs
- [SCRIPTS.md](SCRIPTS.md) - Script documentation
- [TESTING.md](TESTING.md) - Testing guide
- [TEST_COVERAGE.md](TEST_COVERAGE.md) - Test coverage
- [SUMMARY.md](SUMMARY.md) - Project summary

## 📁 Structure

```
vault-contracts/
├── contracts/          # Smart contracts
│   ├── VaultBTC.sol
│   ├── MockAave.sol
│   ├── OracleEMA.sol
│   ├── LeverageStrategy.sol
│   └── StrategyFactory.sol
├── scripts/           # Deployment and interaction scripts
│   ├── setup-local.ts
│   ├── test-integration.ts
│   └── demo-new-features.ts
├── test/              # Test files (119 tests)
└── typechain-types/   # Generated TypeScript types
```

## 🛠️ Available Scripts

### Testing
- `npm test` - Run all tests (119 tests)
- `npm run test:integration` - Run integration test
- `npm run test:accounting` - Run vault balance tests
- `npm run test:repay` - Run debt repayment tests

### Development
- `npm run build` - Compile contracts
- `npm run setup` - Deploy to local network
- `npm run query` - Query contract states
- `npm run oracle:update` - Update oracle data

## 📦 Contracts

### Core Contracts
- **VaultBTC.sol** - ERC20 token (8 decimals)
- **MockAave.sol** - Lending pool mock
- **OracleEMA.sol** - EMA-based price oracle
- **LeverageStrategy.sol** - Per-user vault with leverage
- **StrategyFactory.sol** - Vault factory

### New Features (v0.2.0)
- ✅ Vault balance vs supplied balance separation
- ✅ `withdrawFromAave()` - Move funds from Aave to vault
- ✅ `repayDebt()` - Manual debt repayment
- ✅ Improved accounting and position tracking

## ✅ Testing

**All 119 tests passing:**
- MockAave: 35 tests
- OracleEMA: 18 tests
- StrategyFactory: 17 tests
- VaultBTC: 16 tests
- LeverageStrategy: 33 tests
  - Vault Balance: 6 tests ✨ NEW
  - Rebalancing: 5 tests
  - Repay Debt: 4 tests ✨ NEW
  - Risk Tiers: 2 tests

## 🎯 Key Features

### Vault Accounting
- **Vault Balance**: Idle BTC (immediately withdrawable)
- **Supplied to Aave**: BTC earning yield (locked if debt exists)
- **BTC Position**: Total BTC position tracking
- **Leverage**: Automatic leverage based on market signals

### Debt Management
- **Manual Repayment**: Repay debt by selling BTC
- **Smart Withdrawal**: Uses vault balance first, then supplied
- **Health Factor**: Automatic health factor management

### Risk Management
- **Risk Tiers**: Low (1.1x), Medium (1.3x), High (1.5x)
- **Oracle Signals**: EMA-based market signals
- **Automatic Rebalancing**: Based on bullish/bearish signals

## 🚦 Usage Example

```typescript
// Create vault
const tx = await factory.createVault(1); // Medium risk
const vaultAddress = getVaultAddressFromEvent(tx);
const strategy = await ethers.getContractAt("LeverageStrategy", vaultAddress);

// Deposit & supply
await vaultBTC.approve(vaultAddress, amount);
await strategy.deposit(amount);
await strategy.supplyToAave(amount);

// Create leverage
await strategy.rebalance();

// Repay debt
await strategy.repayDebt(btcAmount);

// Withdraw
await strategy.withdrawFromAave(amount); // Only if no debt
await strategy.withdraw(amount);
```

## 📊 Integration Test

Run the full lifecycle test:

```bash
npm run test:integration
```

**Test Flow:**
1. Deploy contracts
2. Create vault
3. Deposit & supply to Aave
4. Rebalance (create leverage)
5. Repay debt
6. Withdraw from Aave
7. Withdraw to wallet

## 🔐 Security

- Owner-only access for sensitive operations
- Health factor enforcement
- Balance validation
- Debt checks before withdrawals
- Comprehensive test coverage

## 🗺️ Roadmap

### v0.3.0 (Next)
- Frontend UI updates
- Transaction history
- Event logging improvements
- Gas optimization

### v1.0.0 (Future)
- Security audit
- Mainnet deployment
- Multi-asset support
- Advanced strategies

## 📝 License

MIT

## 🤝 Contributing

See documentation for implementation details and examples.
