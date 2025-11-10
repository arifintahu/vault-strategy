# 🔧 Troubleshooting Guide

## Common Errors and Solutions

### Error: "could not decode result data (value="0x")"

**Cause**: Contracts are not deployed or Hardhat node is not running.

**Solution**:

1. **Check if Hardhat node is running:**
   ```bash
   # Run this in a terminal and keep it running
   cd vault-contracts
   npx hardhat node
   ```

2. **Deploy contracts:**
   ```bash
   # In a NEW terminal
   cd vault-contracts
   npm run deploy:local
   ```

3. **Refresh the frontend:**
   - Reload the page in your browser
   - The errors should disappear

---

### Error: "EADDRINUSE: address already in use 127.0.0.1:8545"

**Cause**: Hardhat node is already running.

**Solution**:

**Option 1: Use the existing node**
```bash
# Just deploy contracts to the running node
cd vault-contracts
npm run deploy:local
```

**Option 2: Kill and restart**
```bash
# Windows
netstat -ano | findstr :8545
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8545 | xargs kill -9

# Then start fresh
cd vault-contracts
npx hardhat node
```

---

### Error: "Cannot connect to Hardhat node"

**Cause**: Hardhat node is not running.

**Solution**:
```bash
cd vault-contracts
npx hardhat node
```

Keep this terminal open!

---

### Error: "MetaMask - Wrong Network"

**Cause**: MetaMask is not connected to Hardhat Local network.

**Solution**:

1. Open MetaMask
2. Click network dropdown (top)
3. Select "Hardhat Local"

If you don't see it, add it:
- Network name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency: ETH

---

### Error: "Insufficient funds" or "No vBTC balance"

**Cause**: Your account doesn't have vBTC tokens.

**Solution**:

**Option 1: Use Hardhat Console**
```bash
cd vault-contracts
npx hardhat console --network localhost
```

Then:
```javascript
const VaultBTC = await ethers.getContractFactory("VaultBTC");
const vbtc = await VaultBTC.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
const [signer] = await ethers.getSigners();
await vbtc.mint(signer.address, ethers.parseUnits("100", 8));
console.log("Minted 100 vBTC!");
```

**Option 2: Use deployment script**
The deploy script already mints 10 vBTC to the deployer address.

---

### Error: "Transaction failed" or "Nonce too high"

**Cause**: MetaMask transaction history is out of sync.

**Solution**:

1. Open MetaMask
2. Settings → Advanced
3. Scroll to "Clear activity tab data"
4. Click "Clear"
5. Try transaction again

---

### Error: "Contract not found at address"

**Cause**: Contracts were deployed to a different network or addresses changed.

**Solution**:

1. **Redeploy contracts:**
   ```bash
   cd vault-contracts
   npm run deploy:local
   ```

2. **Verify addresses match:**
   - Check deployment output
   - Compare with `frontend/src/contracts/addresses.ts`
   - They should match exactly

---

### Frontend shows blank page or errors

**Cause**: Various issues with build or dependencies.

**Solution**:

1. **Rebuild frontend:**
   ```bash
   cd frontend
   rm -rf node_modules dist
   npm install
   npm run dev
   ```

2. **Check browser console:**
   - Press F12
   - Look for errors in Console tab
   - Follow error messages

---

### MetaMask doesn't pop up for transactions

**Cause**: MetaMask is locked or not installed.

**Solution**:

1. Check MetaMask is installed
2. Unlock MetaMask
3. Refresh the page
4. Try transaction again

---

## Quick Status Check

Run this to check if everything is working:

```bash
./check-status.sh
```

Or manually check:

1. **Hardhat node running?**
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     http://127.0.0.1:8545
   ```
   Should return a block number.

2. **Contracts deployed?**
   ```bash
   cd vault-contracts
   npm run query
   ```
   Should show contract states.

3. **Frontend running?**
   Open http://localhost:5173
   Should see the app.

---

## Complete Reset

If nothing works, do a complete reset:

```bash
# 1. Stop all processes
# Kill Hardhat node (Ctrl+C in its terminal)
# Kill frontend (Ctrl+C in its terminal)

# 2. Clean everything
cd vault-contracts
rm -rf node_modules artifacts cache typechain-types
npm install
npm run build

cd ../frontend
rm -rf node_modules dist
npm install

# 3. Start fresh
# Terminal 1:
cd vault-contracts
npx hardhat node

# Terminal 2:
cd vault-contracts
npm run deploy:local

# Terminal 3:
cd frontend
npm run dev

# 4. Reset MetaMask
# Settings → Advanced → Clear activity tab data
```

---

## Still Having Issues?

### Check the logs:

1. **Hardhat node logs** - Check the terminal where `npx hardhat node` is running
2. **Browser console** - Press F12 and check Console tab
3. **MetaMask** - Check for error messages in MetaMask popup

### Verify setup:

- [ ] Node.js 18+ installed
- [ ] MetaMask installed
- [ ] Hardhat node running
- [ ] Contracts deployed
- [ ] Frontend running
- [ ] MetaMask connected to Hardhat Local
- [ ] Test account imported in MetaMask

### Common mistakes:

- ❌ Forgot to keep Hardhat node running
- ❌ Didn't deploy contracts after starting node
- ❌ MetaMask connected to wrong network
- ❌ Using wrong account (no vBTC balance)
- ❌ Didn't import test account private key

---

## Need More Help?

Check these files:
- `QUICK_START.md` - Complete setup guide
- `frontend/README.md` - Frontend documentation
- `vault-contracts/SCRIPTS.md` - Contract scripts
- `MONOREPO_GUIDE.md` - Monorepo guide

---

**Pro Tip**: Keep 3 terminals open:
1. Hardhat node (`npx hardhat node`)
2. Commands (`npm run deploy:local`, etc.)
3. Frontend (`npm run dev`)
