# 🚀 Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MetaMask browser extension installed

## Step-by-Step Setup

### 1. Start Hardhat Node

Open a new terminal and run:

```bash
cd vault-contracts
npx hardhat node
```

**Keep this terminal running!** You should see:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

### 2. Deploy Contracts

Open a **new terminal** (keep the first one running) and run:

```bash
cd vault-contracts
npm run deploy:local
```

You should see:

```
✅ Deployment Summary
VaultBTC: 0x5FbDB2315678afecb367f032d93F642f64180aa3
MockAave: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
OracleEMA: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
StrategyFactory: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

### 3. Configure MetaMask

#### Add Hardhat Network

1. Open MetaMask
2. Click network dropdown (top left)
3. Click "Add network" → "Add a network manually"
4. Enter:
   - **Network name**: Hardhat Local
   - **New RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency symbol**: ETH
5. Click "Save"

#### Import Test Account

1. In MetaMask, click account icon → "Import Account"
2. Select "Private Key"
3. Paste this private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click "Import"

This account has 10,000 ETH for testing.

### 4. Get Test vBTC

Run this script to mint vBTC to your account:

```bash
cd vault-contracts
npx hardhat console --network localhost
```

Then in the console:

```javascript
const VaultBTC = await ethers.getContractFactory("VaultBTC");
const vbtc = await VaultBTC.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
await vbtc.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", ethers.parseUnits("100", 8));
console.log("Minted 100 vBTC!");
```

Press Ctrl+C twice to exit.

### 5. Start Frontend

Open a **third terminal** and run:

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

### 6. Connect Wallet

1. Click "Connect Wallet" button
2. MetaMask will pop up
3. Select the imported account
4. Click "Connect"

### 7. Use the App

Now you can:

1. **View Oracle Status** - See BTC price and EMA signals
2. **Create Vault** - Select risk tier and create a vault
3. **Deposit vBTC** - Add vBTC to your vault
4. **Supply to Aave** - Lend vBTC to earn yield
5. **Rebalance** - Adjust leverage based on market signals

## Troubleshooting

### Error: "Contract not deployed"

**Solution**: Make sure you ran step 2 (deploy contracts)

```bash
cd vault-contracts
npm run deploy:local
```

### Error: "Cannot connect to Hardhat node"

**Solution**: Make sure Hardhat node is running (step 1)

```bash
cd vault-contracts
npx hardhat node
```

### Error: "Insufficient funds"

**Solution**: Make sure you:
1. Imported the test account in MetaMask
2. Minted vBTC to your account (step 4)

### MetaMask shows wrong network

**Solution**: 
1. Open MetaMask
2. Click network dropdown
3. Select "Hardhat Local"

### Transactions fail

**Solution**: Reset MetaMask account:
1. MetaMask → Settings → Advanced
2. Scroll down to "Clear activity tab data"
3. Click "Clear"

## Terminal Summary

You should have **3 terminals running**:

```
Terminal 1: Hardhat Node
cd vault-contracts && npx hardhat node

Terminal 2: Available for commands
cd vault-contracts

Terminal 3: Frontend Dev Server
cd frontend && npm run dev
```

## Testing the Full Flow

### 1. Create a Vault

1. Select risk tier (Low/Medium/High)
2. Click "Create Vault"
3. Confirm transaction in MetaMask
4. Wait for confirmation
5. Your vault appears in the list

### 2. Deposit vBTC

1. Click on your vault
2. Enter amount (e.g., 5)
3. Click "Deposit"
4. Confirm transaction
5. Wait for confirmation

### 3. Supply to Aave

1. Enter amount to supply
2. Click "Supply to Aave"
3. Confirm transaction
4. Your vault now earns yield

### 4. Rebalance

1. Click "Rebalance" button
2. Confirm transaction
3. Leverage adjusts based on market signal

## Useful Commands

```bash
# Check contract deployment
cd vault-contracts
npm run query

# Run simulation
npm run simulate

# Update oracle (simulate market changes)
npm run oracle:update

# View all contract states
npm run query
```

## Next Steps

- Experiment with different risk tiers
- Try rebalancing at different market conditions
- Monitor how leverage changes with EMA signals
- Test deposit/withdraw flows

## Need Help?

Check the documentation:
- `frontend/README.md` - Frontend documentation
- `vault-contracts/SCRIPTS.md` - Contract scripts guide
- `MONOREPO_GUIDE.md` - Complete monorepo guide

---

**Happy Testing!** 🎉
