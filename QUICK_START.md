# Quick Start Guide

Get the Vault Strategy dApp running in 3 simple steps!

## Prerequisites

- Node.js 18+ installed
- A Web3 wallet (MetaMask, OKX Wallet, etc.)

## Step 1: Start Hardhat Node

Open a terminal and start the local blockchain:

```bash
cd vault-contracts
npx hardhat node
```

Keep this terminal running. You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

## Step 2: Deploy & Setup Contracts

Open a **new terminal** and run the setup script:

```bash
cd vault-contracts
npm run setup
```

This will:
- ✅ Deploy all contracts (VaultBTC, MockAave, OracleEMA, StrategyFactory)
- ✅ Initialize oracle with BTC price data ($50,000)
- ✅ Mint 10 vBTC to the deployer
- ✅ Display all contract addresses

**Important:** Copy the contract addresses from the output!

## Step 3: Update Frontend & Start

1. Update contract addresses in `frontend/src/contracts/addresses.ts` with the addresses from Step 2

2. Start the frontend:

```bash
cd frontend
npm install  # First time only
npm run dev
```

3. Open http://localhost:5173 in your browser

4. Click "Connect Wallet" and select your wallet

5. **For MetaMask:** Network will be added automatically when prompted ✅

6. **For OKX Wallet:** Add network manually first (OKX requires HTTPS for API):
   - Open OKX Wallet → Network dropdown → Manage Networks → Add Network
   - Enter:
     - Network Name: Hardhat Local
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency Symbol: ETH
   - **Detailed guide:** `frontend/OKX_SETUP_INSTRUCTIONS.md`
   - **Debug tool:** http://localhost:5173/debug.html

## Step 4: Fund Your Wallet (Optional)

If you need ETH in your wallet for testing:

```bash
cd vault-contracts
npx hardhat run scripts/fund-deployer.ts --network localhost
```

Or manually send ETH from one of Hardhat's default accounts.

## You're Ready! 🎉

You can now:
- View real-time oracle data (BTC price & EMAs)
- Create leverage strategy vaults (Low/Medium/High risk)
- Deposit vBTC into vaults
- Borrow from Aave
- Manage your positions

## Troubleshooting

### "Cannot connect to Hardhat node"
- Make sure `npx hardhat node` is running in a separate terminal
- Check that it's running on http://127.0.0.1:8545

### "Oracle not initialized"
- Run: `cd vault-contracts && npm run oracle:init`

### "Wrong network" in wallet
- Click the "Switch to Hardhat Network" button in the app
- Or manually add the network in your wallet settings

### OKX Wallet not connecting
- Make sure OKX Wallet extension is installed and unlocked
- Try refreshing the page
- RainbowKit will automatically detect OKX Wallet

### Contract addresses don't match
- Make sure you updated `frontend/src/contracts/addresses.ts` with the addresses from `npm run setup`
- Restart the frontend after updating addresses

## Development Workflow

### Reset Everything
If you want to start fresh:

1. Stop Hardhat node (Ctrl+C)
2. Restart: `npx hardhat node`
3. Redeploy: `npm run setup`
4. Update frontend addresses
5. Refresh browser

### Update Oracle Price
To simulate price changes:

```bash
cd vault-contracts
npx hardhat run scripts/update-oracle.ts --network localhost
```

## Project Structure

```
vault-strategy/
├── vault-contracts/          # Smart contracts
│   ├── contracts/            # Solidity contracts
│   ├── scripts/              # Deployment & utility scripts
│   └── test/                 # Contract tests
└── frontend/                 # React frontend
    ├── src/
    │   ├── components/       # UI components
    │   ├── contracts/        # ABIs & addresses
    │   ├── hooks/            # React hooks
    │   └── config/           # wagmi/RainbowKit config
    └── WALLET_SETUP.md       # Detailed wallet guide
```

## Next Steps

- Read `vault-contracts/README.md` for contract details
- Read `frontend/WALLET_SETUP.md` for wallet configuration
- Check `vault-contracts/DEPLOYMENT.md` for deployment guide
- Explore the code and customize!

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error messages in browser console
3. Check Hardhat node terminal for errors
4. Ensure all dependencies are installed

Happy building! 🚀
