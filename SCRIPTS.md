# Scripts Guide

This document describes all available scripts for interacting with the Vault Strategy contracts.

## Quick Start

```bash
# Start local Hardhat node (in separate terminal)
npx hardhat node

# Run simulation
npm run simulate

# Query contract states
npm run query

# Update oracle data
npm run oracle:update

# Supply to Aave
npm run aave:supply
```

## Available Scripts

### 1. Deploy (`deploy.ts`)

Deploys all contracts to the network.

```bash
npm run deploy:local
# or
npx hardhat run scripts/deploy.ts --network localhost
```

**What it does:**
- Deploys VaultBTC token
- Deploys MockAave lending pool
- Deploys OracleEMA with initial values
- Deploys StrategyFactory
- Mints 10 vBTC to deployer for testing

**Output:**
```
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
VaultBTC: 0x5FbDB2315678afecb367f032d93F642f64180aa3
MockAave: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
OracleEMA: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
StrategyFactory: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

---

### 2. Simulate (`simulate.ts`)

Runs a complete end-to-end simulation of the leverage strategy.

```bash
npm run simulate
# or
npx hardhat run scripts/simulate.ts
```

**What it does:**
1. Deploys all contracts
2. Creates vaults for 2 users (Medium and High risk)
3. Deposits vBTC to vaults
4. Supplies to Aave
5. Simulates market conditions:
   - Bullish market (price rises)
   - Continued rally
   - Bearish reversal (price drops)
   - Market recovery
6. Triggers rebalancing after each market change
7. Shows vault states throughout

**Use cases:**
- Testing the complete workflow
- Understanding how leverage changes with market conditions
- Demonstrating the system to stakeholders
- Debugging strategy logic

**Sample output:**
```
🚀 Starting Vault Strategy Simulation

👥 Accounts:
  Deployer: 0xf39Fd...
  User1: 0x70997...
  User2: 0x3C44c...

📦 Deploying Contracts...
  ✅ VaultBTC: 0x5FbDB...
  ✅ MockAave: 0xe7f17...
  ✅ OracleEMA: 0x9fE46...
  ✅ StrategyFactory: 0xCf7Ed...

📈 Simulating Bullish Market (Price rises to $65k)...
  User1 Vault:
    Target Leverage: 1.10x
    Current Leverage: 1.10x
    Borrowed: $48,000.00
```

---

### 3. Query State (`query-state.ts`)

Queries and displays the current state of all contracts.

```bash
npm run query
# or
npx hardhat run scripts/query-state.ts --network localhost
```

**What it does:**
- Displays VaultBTC state (balances, total supply)
- Shows Oracle state (price, EMAs, signals)
- Lists MockAave positions (supplied, borrowed, health factors)
- Shows Factory state (total vaults, vaults by owner)
- Displays individual vault states (leverage, positions, metrics)

**Use cases:**
- Monitoring contract states
- Debugging issues
- Auditing positions
- Generating reports

**Sample output:**
```
🔍 Querying Contract States

═══════════════════════════════════════════════════════
📊 CONTRACT STATES
═══════════════════════════════════════════════════════

🪙 VaultBTC State
─────────────────────────────────────────────────────
  Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  Name: vaultBTC
  Symbol: vBTC
  Decimals: 8
  Total Supply: 15.00000000 vBTC

🔮 OracleEMA State
─────────────────────────────────────────────────────
  Current Price: $60,000.00
  EMA 20-day: $59,000.00
  Signal: Strong Bullish 📈📈
```

---

### 4. Update Oracle (`update-oracle.ts`)

Updates oracle with new price and EMA data, simulating different market conditions.

```bash
npm run oracle:update
# or
npx hardhat run scripts/update-oracle.ts --network localhost
```

**What it does:**
- Deploys oracle (or connects to existing)
- Runs through 5 market scenarios:
  1. Bullish market (price rises)
  2. Continued rally
  3. Bearish reversal
  4. Neutral/consolidation
  5. Market recovery
- Shows signal changes and recommendations

**Use cases:**
- Testing oracle updates
- Simulating market conditions
- Understanding signal detection
- Training on EMA interpretation

**Sample output:**
```
🔮 Oracle Update Script

═══════════════════════════════════════════════════════
📈 Scenario 1: Bullish Market Update
═══════════════════════════════════════════════════════

📝 Price rises above all EMAs - Strong bullish signal

  New Values:
    Price: $65,000
    EMA20: $63,000
    EMA50: $61,000
    EMA200: $58,000

  ✅ Oracle updated

  Current State:
    Signal: Strong Bullish 📈📈
    
  Strategy Recommendation:
    📈 Increase leverage (bullish signal)
```

---

### 5. Supply to Aave (`supply-aave.ts`)

Demonstrates supplying collateral and borrowing from Aave.

```bash
npm run aave:supply
# or
npx hardhat run scripts/supply-aave.ts --network localhost
```

**What it does:**
1. Deploys VaultBTC and MockAave
2. Mints vBTC to users
3. User1 workflow:
   - Supplies collateral
   - Borrows stablecoin
   - Borrows more
   - Repays debt
   - Withdraws collateral
4. User2 workflow:
   - Supplies collateral only (earn yield)
5. Shows health factors and positions

**Use cases:**
- Understanding Aave mechanics
- Testing supply/borrow/repay flows
- Monitoring health factors
- Calculating utilization rates

**Sample output:**
```
🏦 Aave Supply & Borrow Script

⚙️  Aave Configuration:
  Supply APR: 3 %
  Borrow APR: 5 %
  Collateral Factor: 75 %
  Liquidation Threshold: 80 %

═══════════════════════════════════════════════════════
👤 User1: Supply and Borrow
═══════════════════════════════════════════════════════

📥 Step 1: Supply Collateral
  ✅ Supplied 5.0000 vBTC

  User1 Position:
    Supplied: 5.0000 vBTC
    Borrowed: $0.00
    Health Factor: ∞ (no debt)
    Status: ✅ No Risk

💸 Step 2: Borrow Stablecoin
  ✅ Borrowed $100,000.00

  User1 Position:
    Supplied: 5.0000 vBTC
    Borrowed: $100,000.00
    Health Factor: 2.40
    Status: ✅ Very Healthy
```

---

## Running on Different Networks

### Local Network

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Run scripts
npm run simulate
npm run query
```

### Testnet (e.g., Sepolia)

```bash
# Update hardhat.config.ts with network config
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat run scripts/simulate.ts --network sepolia
```

## Script Parameters

All scripts use default values, but you can modify them by editing the script files:

### Common Parameters

```typescript
// Price precision (8 decimals)
const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

// Example values
toInt(60000)  // $60,000 BTC price
toInt(5)      // 5 vBTC
toInt(1.5)    // 1.5 vBTC
```

### Oracle Values

```typescript
// In update-oracle.ts or simulate.ts
await oracle.setEMAs(
  toInt(65000),  // current price
  toInt(63000),  // 20-day EMA
  toInt(61000),  // 50-day EMA
  toInt(58000)   // 200-day EMA
);
```

### Risk Tiers

```typescript
// In simulate.ts or when creating vaults
await factory.createVault(0);  // Low risk (1.1x max)
await factory.createVault(1);  // Medium risk (1.3x max)
await factory.createVault(2);  // High risk (1.5x max)
```

## Troubleshooting

### "Contract not deployed"
Make sure to deploy contracts first:
```bash
npm run deploy:local
```

### "Insufficient balance"
Mint tokens first or check balances:
```typescript
await vbtc.mint(userAddress, toInt(10));
```

### "Transaction reverted"
Check error messages and contract state. Use query script:
```bash
npm run query
```

### Network issues
Ensure Hardhat node is running:
```bash
npx hardhat node
```

## Best Practices

1. **Start with simulation**: Run `npm run simulate` to understand the full workflow
2. **Query often**: Use `npm run query` to check states during development
3. **Test oracle updates**: Use `npm run oracle:update` to see how signals change
4. **Understand Aave**: Run `npm run aave:supply` to learn lending mechanics
5. **Read output carefully**: Scripts provide detailed explanations and recommendations

## Next Steps

After running the scripts:
1. Review the output to understand the system
2. Modify script parameters to test different scenarios
3. Create your own scripts for specific use cases
4. Integrate with frontend applications
5. Deploy to testnet for real testing

## Additional Resources

- [README.md](README.md) - Project overview
- [TESTING.md](TESTING.md) - Testing guide
- [Architecture docs](.kiro/steering/architecture.md) - System design
