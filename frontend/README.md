# Vault Strategy - Frontend

React + TypeScript frontend for interacting with Vault Strategy contracts.

## Setup

```bash
# Install Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install ethers.js for contract interaction
npm install ethers

# Install additional dependencies
npm install @tanstack/react-query wagmi viem
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utilities
│   ├── contracts/     # Contract ABIs and addresses
│   └── App.tsx        # Main app component
├── public/            # Static assets
└── package.json
```

## Features

- Connect wallet (MetaMask, WalletConnect)
- Create leverage strategy vault
- Deposit/withdraw vBTC
- Supply to Aave
- View vault state and metrics
- Monitor oracle signals
- Trigger rebalancing

## Contract Integration

The frontend will interact with deployed contracts:
- VaultBTC
- MockAave
- OracleEMA
- StrategyFactory
- LeverageStrategy

## Coming Soon

This frontend is under development. Check back soon for updates!
