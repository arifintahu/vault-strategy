# Vault Strategy - Frontend

React + TypeScript frontend for interacting with Vault Strategy smart contracts.

## Features

✅ **Wallet Connection** - Connect with MetaMask  
✅ **Oracle Monitoring** - Real-time EMA signals and price data  
✅ **Vault Management** - Create and manage leverage vaults  
✅ **Deposit/Withdraw** - Manage vBTC in vaults  
✅ **Supply to Aave** - Lend vBTC to earn yield  
✅ **Rebalancing** - Trigger leverage adjustments  
✅ **Portfolio Tracking** - View vault metrics and leverage  

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Ethers.js 6** - Ethereum interaction
- **CSS3** - Styling

## Prerequisites

- Node.js 18+
- MetaMask browser extension
- Running Hardhat node with deployed contracts

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Update Contract Addresses

Edit `src/contracts/addresses.ts` with your deployed contract addresses:

```typescript
export const CONTRACTS = {
  VaultBTC: '0x...',
  MockAave: '0x...',
  OracleEMA: '0x...',
  StrategyFactory: '0x...',
};
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

## Usage

### 1. Start Hardhat Node

In a separate terminal:

```bash
cd ../vault-contracts
npx hardhat node
```

### 2. Deploy Contracts

```bash
cd ../vault-contracts
npm run deploy:local
```

Copy the deployed addresses to `src/contracts/addresses.ts`

### 3. Connect MetaMask

1. Open MetaMask
2. Add Hardhat network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

3. Import a test account from Hardhat node output

### 4. Get Test vBTC

Run the mint script or use the deployed contracts to mint test vBTC to your address.

### 5. Use the App

1. **Connect Wallet** - Click "Connect Wallet" button
2. **View Oracle** - See current BTC price and EMA signals
3. **Create Vault** - Select risk tier and create a new vault
4. **Deposit vBTC** - Add vBTC to your vault
5. **Supply to Aave** - Lend vBTC to earn yield
6. **Rebalance** - Adjust leverage based on market conditions

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── wallet/
│   │   │   └── ConnectWallet.tsx
│   │   ├── vault/
│   │   │   ├── CreateVault.tsx
│   │   │   ├── VaultCard.tsx
│   │   │   ├── VaultList.tsx
│   │   │   └── VaultActions.tsx
│   │   ├── oracle/
│   │   │   └── OracleStatus.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Layout.tsx
│   ├── hooks/
│   │   ├── useWallet.ts
│   │   ├── useOracle.ts
│   │   └── useVaults.ts
│   ├── utils/
│   │   ├── contracts.ts
│   │   └── formatting.ts
│   ├── contracts/
│   │   ├── abis/
│   │   └── addresses.ts
│   ├── types/
│   │   └── contracts.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
└── package.json
```

## Components

### ConnectWallet
Wallet connection button with account display

### OracleStatus
Real-time display of BTC price, EMAs, and market signals

### CreateVault
Form to create new leverage strategy vault with risk tier selection

### VaultList
Grid display of user's vaults with key metrics

### VaultCard
Individual vault card showing balance, leverage, and position

### VaultActions
Action panel for deposit, withdraw, supply to Aave, and rebalance

## Hooks

### useWallet
Manages wallet connection state and MetaMask integration

### useOracle
Fetches and updates oracle data (price, EMAs, signals)

### useVaults
Loads user's vaults and their states from the blockchain

## Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Troubleshooting

### "MetaMask not installed"
Install MetaMask browser extension

### "Contract not deployed"
Make sure contracts are deployed and addresses are updated in `src/contracts/addresses.ts`

### "Transaction failed"
- Check you have enough ETH for gas
- Verify you have vBTC balance for deposits
- Ensure you're connected to the correct network (Hardhat Local)

### "Cannot read properties of undefined"
- Verify Hardhat node is running
- Check contract addresses are correct
- Ensure ABIs are copied from vault-contracts

## Development

### Adding New Features

1. Create component in `src/components/`
2. Add hook if needed in `src/hooks/`
3. Update types in `src/types/contracts.ts`
4. Add styling in `src/App.css`

### Updating Contract ABIs

After recompiling contracts:

```bash
# From root directory
cp vault-contracts/artifacts/contracts/VaultBTC.sol/VaultBTC.json frontend/src/contracts/abis/
cp vault-contracts/artifacts/contracts/MockAave.sol/MockAave.json frontend/src/contracts/abis/
cp vault-contracts/artifacts/contracts/OracleEMA.sol/OracleEMA.json frontend/src/contracts/abis/
cp vault-contracts/artifacts/contracts/LeverageStrategy.sol/LeverageStrategy.json frontend/src/contracts/abis/
cp vault-contracts/artifacts/contracts/StrategyFactory.sol/StrategyFactory.json frontend/src/contracts/abis/
```

## License

MIT
