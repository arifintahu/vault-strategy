# OKX Wallet Setup for Hardhat Local

## The Issue

OKX Wallet requires HTTPS URLs for RPC endpoints when adding networks via API. Since Hardhat runs on `http://127.0.0.1:8545`, we need to add the network manually.

## Step-by-Step Setup

### 1. Open OKX Wallet Extension

Click the OKX Wallet icon in your browser toolbar.

### 2. Access Network Settings

- Click on the **network dropdown** at the top (it might show "Polygon" or another network)
- Click **"Manage Networks"** or **"Network Settings"**
- Click **"Add Network"** or **"Add Network Manually"**

### 3. Enter Hardhat Network Details

Fill in the form with these exact values:

```
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
Block Explorer URL: (leave empty)
```

### 4. Save and Switch

- Click **"Save"** or **"Add"**
- The network will be added to your list
- **Switch to "Hardhat Local"** network

### 5. Verify Connection

1. Go back to the app: `http://localhost:5173`
2. Click **"Connect Wallet"**
3. Select **"Injected"** or **"Browser Wallet"**
4. Approve the connection in OKX Wallet
5. You should now be connected!

## Visual Guide

### Finding Network Settings in OKX Wallet

```
┌─────────────────────────┐
│  OKX Wallet             │
│  ┌──────────────────┐   │
│  │ Polygon ▼        │ ← Click here
│  └──────────────────┘   │
│                          │
│  Dropdown appears:       │
│  ┌──────────────────┐   │
│  │ Ethereum         │   │
│  │ Polygon          │   │
│  │ BSC              │   │
│  │ ───────────────  │   │
│  │ Manage Networks  │ ← Click here
│  └──────────────────┘   │
└─────────────────────────┘
```

### Add Network Form

```
┌─────────────────────────────────┐
│ Add Network                     │
├─────────────────────────────────┤
│ Network Name                    │
│ ┌─────────────────────────────┐ │
│ │ Hardhat Local               │ │
│ └─────────────────────────────┘ │
│                                 │
│ RPC URL                         │
│ ┌─────────────────────────────┐ │
│ │ http://127.0.0.1:8545       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Chain ID                        │
│ ┌─────────────────────────────┐ │
│ │ 31337                       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Currency Symbol                 │
│ ┌─────────────────────────────┐ │
│ │ ETH                         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Block Explorer (optional)       │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│        [Cancel]  [Save]         │
└─────────────────────────────────┘
```

## Troubleshooting

### "Network already exists"
- The network is already added
- Just switch to it from the network dropdown

### "Invalid RPC URL"
- Make sure Hardhat node is running: `npx hardhat node`
- Verify the URL is exactly: `http://127.0.0.1:8545`
- No trailing slash!

### "Cannot connect to network"
- Ensure Hardhat node is running
- Check the terminal running Hardhat for errors
- Try restarting Hardhat node

### Connection works but transactions fail
- Make sure contracts are deployed: `npm run setup`
- Check you're on the correct network in OKX Wallet
- Verify your account has ETH (use `fund-deployer.ts` script)

## Why Manual Setup?

OKX Wallet enforces HTTPS for RPC URLs when adding networks programmatically (via `wallet_addEthereumChain`). This is a security feature to prevent malicious sites from adding fake networks.

However, when you add a network manually through the OKX Wallet UI, it allows HTTP URLs for local development.

MetaMask is more permissive and allows HTTP URLs via API, which is why it works automatically.

## Alternative: Use MetaMask for Development

If you prefer automatic network switching, you can use MetaMask for development:

1. Install MetaMask
2. Disable OKX Wallet temporarily
3. The app will automatically add Hardhat network to MetaMask
4. Switch back to OKX Wallet for production testing

## After Setup

Once the network is added:
- ✅ You can connect normally through the app
- ✅ Network switching will work
- ✅ All transactions will work
- ✅ You only need to do this once per browser

## Need Help?

Run the debug page to verify everything:
```
http://localhost:5173/debug.html
```

This will show:
- ✅ If OKX Wallet is detected
- ✅ If connection works
- ✅ Current network
- ✅ Step-by-step instructions
