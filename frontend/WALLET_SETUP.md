# Wallet Connection Setup

This frontend uses **RainbowKit** with **wagmi** for wallet connections, providing a seamless experience across multiple wallets including MetaMask, OKX Wallet, Coinbase Wallet, and more.

## Features

- 🎨 Beautiful, intuitive wallet connection UI
- 🔄 Automatic network switching
- 🔌 Support for multiple wallets (MetaMask, OKX, Coinbase, WalletConnect, etc.)
- ⚡ Built on wagmi for optimal performance
- 🎯 Hardhat Local network pre-configured

## Adding Hardhat Network to Your Wallet

When you connect your wallet, RainbowKit will automatically prompt you to add the Hardhat Local network if it's not already configured.

### Network Details
- **Network Name:** Hardhat Local
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency Symbol:** ETH

### Manual Setup (if needed)

#### MetaMask
1. Click the network dropdown at the top
2. Click "Add Network"
3. Click "Add a network manually"
4. Enter the network details above
5. Click "Save"

#### OKX Wallet
1. Open wallet settings
2. Go to "Networks"
3. Click "Add Network"
4. Enter the network details above
5. Click "Confirm"

## WalletConnect Project ID

To enable WalletConnect support, you need to:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a free account
3. Create a new project
4. Copy your Project ID
5. Update `frontend/src/config/wagmi.ts`:
   ```typescript
   projectId: 'YOUR_PROJECT_ID_HERE'
   ```

## Usage

The wallet connection is handled automatically by RainbowKit. Simply click the "Connect Wallet" button in the header.

### In Your Components

```typescript
import { useWallet } from '../hooks/useWallet';

function MyComponent() {
  const { account, isConnected } = useWallet();
  
  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }
  
  return <div>Connected: {account}</div>;
}
```

## Supported Wallets

- MetaMask
- OKX Wallet
- Coinbase Wallet
- WalletConnect (any wallet supporting WalletConnect)
- Rainbow Wallet
- Trust Wallet
- And many more...
