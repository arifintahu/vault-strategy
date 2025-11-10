# Vault Strategy Frontend

A React + TypeScript frontend for the Vault Strategy protocol with RainbowKit wallet integration.

## Features

- 🎨 **RainbowKit Integration** - Beautiful wallet connection UI supporting MetaMask, OKX Wallet, Coinbase, and more
- ⚡ **wagmi + viem** - Modern Ethereum library stack
- 🔄 **Automatic Network Switching** - Seamlessly switch to Hardhat Local network
- 📊 **Real-time Oracle Data** - EMA-based price oracle monitoring
- 🏦 **Vault Management** - Create and manage leverage strategy vaults
- 💰 **Aave Integration** - Lending and borrowing functionality

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure WalletConnect (Optional)

For WalletConnect support, get a free Project ID:

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a project
3. Copy your Project ID
4. Update `src/config/wagmi.ts`:
   ```typescript
   projectId: 'YOUR_PROJECT_ID_HERE'
   ```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Connect Your Wallet

1. Make sure Hardhat node is running: `cd ../vault-contracts && npx hardhat node`
2. Click "Connect Wallet" in the app
3. Select your wallet (MetaMask, OKX, etc.)
4. When prompted, add/switch to Hardhat Local network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   ├── oracle/       # Oracle status display
│   │   ├── vault/        # Vault management
│   │   └── wallet/       # Wallet connection
│   ├── config/           # Configuration files
│   │   └── wagmi.ts      # wagmi/RainbowKit config
│   ├── contracts/        # Contract ABIs and addresses
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── WALLET_SETUP.md       # Detailed wallet setup guide
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Supported Wallets

- MetaMask
- OKX Wallet
- Coinbase Wallet
- Rainbow Wallet
- Trust Wallet
- WalletConnect (any compatible wallet)
- And many more...

## Network Configuration

The app is pre-configured for Hardhat Local network:

```typescript
{
  id: 31337,
  name: 'Hardhat Local',
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] }
  }
}
```

## Contract Addresses

Update contract addresses in `src/contracts/addresses.ts` after deployment.

## Troubleshooting

### OKX Wallet Won't Connect
- **OKX Wallet requires manual network setup** (doesn't accept HTTP URLs via API)
- See `OKX_SETUP_INSTRUCTIONS.md` for step-by-step guide
- Or use the debug page: `http://localhost:5173/debug.html`

### MetaMask Connection
- MetaMask works automatically with network auto-add
- Just click "Connect Wallet" → "MetaMask" → Approve

### Wallet Won't Connect
- Ensure Hardhat node is running
- Check that you're on the correct network (Chain ID: 31337)
- Try refreshing the page

### Network Not Found
- Manually add the Hardhat Local network in your wallet
- See `OKX_SETUP_INSTRUCTIONS.md` or `WALLET_SETUP.md` for detailed instructions

### Transaction Fails
- Ensure you have ETH in your wallet
- Check that contracts are deployed
- Verify contract addresses in `addresses.ts`

## Learn More

- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [React Documentation](https://react.dev/)
