# Vault Strategy

A DeFi protocol for automated, EMA-based leverage management for Bitcoin holders with self-custody guarantees.

## 🏗️ Monorepo Structure

```
vault-strategy/
├── vault-contracts/     # Smart contracts (Hardhat)
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deployment & interaction scripts
│   ├── test/           # Contract tests (113 tests)
│   └── README.md
├── frontend/           # React + TypeScript frontend
│   ├── src/           # Frontend source code
│   ├── public/        # Static assets
│   └── README.md
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup Contracts

```bash
cd vault-contracts
npm install
npm run build
npm test              # Run 113 tests
npm run simulate      # Run full simulation
```

### Setup Frontend

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install ethers @tanstack/react-query wagmi viem
npm run dev
```

## 📦 Contracts

The smart contract suite includes:

- **VaultBTC** - ERC20 token (8 decimals, BTC-style)
- **MockAave** - Simplified lending pool
- **OracleEMA** - EMA oracle with signal detection
- **LeverageStrategy** - Per-user vault with automated leverage
- **StrategyFactory** - Factory for creating isolated vaults

### Key Features

✅ **Vault Balance Separation** - Deposits stay as vault balance  
✅ **EMA-Based Signals** - 20/50/200-day EMAs for trend detection  
✅ **Automated Leverage** - Increases on bullish, decreases on bearish  
✅ **Risk Tiers** - Low (1.1x), Medium (1.3x), High (1.5x)  
✅ **Portfolio Tracking** - Average BTC price and position metrics  
✅ **Self-Custody Compatible** - Designed for Bitcoin trustless vaults  

## 🧪 Testing

All contracts have comprehensive test coverage:

```bash
cd vault-contracts
npm test
```

**113 passing tests:**
- VaultBTC: 21 tests
- OracleEMA: 24 tests
- MockAave: 33 tests
- StrategyFactory: 18 tests
- VaultStrategy: 17 tests

## 📜 Scripts

Interactive scripts for contract interaction:

```bash
cd vault-contracts

npm run simulate        # Full end-to-end simulation
npm run query          # Query all contract states
npm run oracle:update  # Update oracle with market data
npm run aave:supply    # Supply and borrow from Aave
```

## 🎨 Frontend (Coming Soon)

React + TypeScript frontend with:

- Wallet connection (MetaMask, WalletConnect)
- Create and manage vaults
- Deposit/withdraw vBTC
- Supply to Aave
- View vault metrics and leverage
- Monitor oracle signals
- Trigger rebalancing

## 📚 Documentation

### Contracts
- [vault-contracts/README.md](vault-contracts/README.md) - Contract documentation
- [vault-contracts/SCRIPTS.md](vault-contracts/SCRIPTS.md) - Script guide
- [vault-contracts/TESTING.md](vault-contracts/TESTING.md) - Testing guide
- [vault-contracts/SUMMARY.md](vault-contracts/SUMMARY.md) - Project summary

### Architecture
- [vault-contracts/.kiro/steering/product.md](vault-contracts/.kiro/steering/product.md) - Product overview
- [vault-contracts/.kiro/steering/architecture.md](vault-contracts/.kiro/steering/architecture.md) - System architecture
- [vault-contracts/.kiro/steering/development.md](vault-contracts/.kiro/steering/development.md) - Development guide

## 🔧 Technology Stack

### Contracts
- Solidity 0.8.24
- Hardhat
- TypeScript
- Ethers.js
- Mocha/Chai

### Frontend
- React 18
- TypeScript
- Vite
- Ethers.js / Wagmi
- TanStack Query

## 🌐 Deployment

### Local Development

```bash
# Terminal 1: Start Hardhat node
cd vault-contracts
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:local

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### Testnet Deployment

```bash
cd vault-contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

## 🛣️ Roadmap

### Phase 1: Demo (✅ Complete)
- ✅ Smart contracts
- ✅ Comprehensive tests
- ✅ Interactive scripts
- ✅ Documentation

### Phase 2: Frontend (🚧 In Progress)
- 🚧 React + TypeScript setup
- ⏳ Wallet integration
- ⏳ Contract interaction
- ⏳ UI components
- ⏳ Dashboard

### Phase 3: Production
- ⏳ Real Aave integration
- ⏳ Chainlink oracle
- ⏳ DEX integration
- ⏳ Security audit
- ⏳ Testnet deployment

### Phase 4: Bitcoin Integration
- ⏳ BitVM3 vault integration
- ⏳ Bitcoin bridge
- ⏳ Mainnet deployment

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT

## 🔗 Links

- Documentation: See `/vault-contracts` and `/frontend` READMEs
- Tests: `cd vault-contracts && npm test`
- Scripts: `cd vault-contracts && npm run simulate`

---

**Status**: ✅ Contracts Complete | 🚧 Frontend In Progress | 🚀 Ready for Enhancement
