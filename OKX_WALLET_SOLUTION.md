# OKX Wallet Connection - Solution

## The Problem

OKX Wallet **cannot** add networks with HTTP URLs via the `wallet_addEthereumChain` API. It requires HTTPS URLs for security reasons.

Since Hardhat runs on `http://127.0.0.1:8545`, automatic network addition doesn't work with OKX Wallet.

## The Solution

**Add the Hardhat network manually in OKX Wallet.**

### Quick Steps:

1. **Open OKX Wallet extension**
2. **Click network dropdown** (top of wallet)
3. **Click "Manage Networks"**
4. **Click "Add Network Manually"**
5. **Enter these details:**
   ```
   Network Name: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   ```
6. **Save and switch to it**
7. **Done!** Now you can connect normally

### Detailed Guide

See `frontend/OKX_SETUP_INSTRUCTIONS.md` for:
- Step-by-step instructions with screenshots
- Visual guides
- Troubleshooting tips
- Common issues and solutions

### Debug Tool

Use the debug page to verify everything works:
```
http://localhost:5173/debug.html
```

This tool will:
- ✅ Check if OKX Wallet is installed
- ✅ Test connection
- ✅ Check current network
- ✅ Show manual setup instructions

## Why This Happens

### OKX Wallet Security Policy

OKX Wallet enforces HTTPS for RPC URLs when adding networks programmatically. This prevents malicious websites from adding fake networks.

**Via API (doesn't work):**
```javascript
// ❌ Fails with error -32602
await provider.request({
  method: 'wallet_addEthereumChain',
  params: [{
    rpcUrls: ['http://127.0.0.1:8545'], // HTTP not allowed!
  }]
});
```

**Manual UI (works):**
- ✅ OKX Wallet UI allows HTTP URLs for local development
- ✅ You have full control and can verify the network details
- ✅ More secure - you explicitly approve the network

### MetaMask Comparison

MetaMask is more permissive and allows HTTP URLs via API, which is why automatic network addition works with MetaMask but not OKX Wallet.

## After Manual Setup

Once you've added the network manually:

✅ **Everything works normally:**
- Connect wallet through the app
- Switch networks automatically
- All transactions work
- No more manual steps needed

✅ **One-time setup:**
- You only need to do this once per browser
- The network stays in your OKX Wallet
- Works across all dApps

## Alternative Solutions

### Option 1: Use MetaMask for Development
- MetaMask allows automatic network addition
- Switch to OKX Wallet for production testing

### Option 2: Use HTTPS Tunnel (Advanced)
- Use tools like `ngrok` or `localtunnel` to create HTTPS tunnel
- Point to your Hardhat node
- More complex setup, not recommended for simple development

### Option 3: Deploy to Testnet
- Deploy contracts to a real testnet (Sepolia, Goerli)
- Use HTTPS RPC URLs
- Automatic network addition works
- Costs real testnet ETH

## Recommendation

**Just add the network manually** - it takes 30 seconds and works perfectly. This is the simplest and most reliable solution for local development with OKX Wallet.

## Files to Reference

- **Setup Guide:** `frontend/OKX_SETUP_INSTRUCTIONS.md`
- **Debug Tool:** `frontend/public/debug.html`
- **General Wallet Guide:** `frontend/OKX_WALLET_GUIDE.md`
- **Quick Start:** `QUICK_START.md`

## Summary

| Wallet | Automatic Network Add | Manual Setup Required |
|--------|----------------------|----------------------|
| MetaMask | ✅ Yes | ❌ No |
| OKX Wallet | ❌ No (HTTP restriction) | ✅ Yes (30 seconds) |
| Coinbase Wallet | ✅ Yes | ❌ No |
| Other Wallets | ✅ Usually Yes | ❌ Usually No |

**Bottom line:** OKX Wallet is more secure but requires one manual step for local development. After that, everything works perfectly!
