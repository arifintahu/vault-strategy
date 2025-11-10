# Vault Strategy Monorepo Guide

## Overview

This guide explains the monorepo structure and how to work with both the contracts and frontend.

## Structure

```
vault-strategy/
├── vault-contracts/          # Smart contracts (Hardhat)
│   ├── contracts/           # Solidity contracts
│   ├── scripts/             # Deployment scripts
│   ├── test/                # Contract tests
│   ├── .kiro/steering/      # Documentation
│   ├── hardhat.config.ts
│   ├── package.json
│   └── README.md
├── frontend/                # React frontend
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   ├── package.json
│   └── README.md
├── README.md               # Root README
├── package.json            # Workspace configuration
└── MONOREPO_GUIDE.md      # This file
```

## Getting Started

### 1. Restructure Existing Project

If you haven't restructured yet:

```bash
# Run the automated script
.\restructure-project.ps1

# Or follow manual steps in RESTRUCTURE.md
```

### 2. Install Dependencies

#### Option A: Install All at Once (Workspace)

```bash
# From root directory
npm install
npm run install:all
```

#### Option B: Install Separately

```bash
# Install contracts
cd vault-contracts
npm install

# Install frontend
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install
npm install ethers wagmi viem @tanstack/react-query
```

### 3. Build Contracts

```bash
cd vault-contracts
npm run build
npm test
```

### 4. Setup Frontend

```bash
cd frontend
# Follow SETUP.md for detailed instructions
npm run dev
```

## Workspace Commands

From the root directory, you can run:

### Contracts

```bash
npm run contracts:build      # Compile contracts
npm run contracts:test       # Run tests
npm run contracts:deploy     # Deploy to local network
npm run contracts:simulate   # Run simulation
npm run contracts:query      # Query contract states
```

### Frontend

```bash
npm run frontend:dev         # Start dev server
npm run frontend:build       # Build for production
npm run frontend:preview     # Preview production build
```

### Combined

```bash
npm run install:all          # Install all dependencies
npm run build:all           # Build contracts and frontend
npm run test:all            # Run all tests
npm run dev                 # Start contracts + frontend
```

## Development Workflow

### Typical Development Flow

1. **Start Hardhat Node**
   ```bash
   cd vault-contracts
   npx hardhat node
   ```

2. **Deploy Contracts** (in new terminal)
   ```bash
   cd vault-contracts
   npm run deploy:local
   # Note the deployed addresses
   ```

3. **Update Frontend Config**
   ```bash
   cd frontend
   # Update .env with contract addresses
   ```

4. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Interact with Contracts**
   - Use frontend UI
   - Or use contract scripts: `npm run simulate`

### Making Changes

#### Contracts

1. Edit contracts in `vault-contracts/contracts/`
2. Compile: `npm run build`
3. Test: `npm test`
4. Deploy: `npm run deploy:local`
5. Update frontend ABIs and addresses

#### Frontend

1. Edit components in `frontend/src/`
2. Changes hot-reload automatically
3. Test in browser
4. Build: `npm run build`

## Contract Integration

### 1. Copy ABIs to Frontend

After building contracts:

```bash
# From root directory
cd vault-contracts
npm run build

# Copy ABIs
cp artifacts/contracts/VaultBTC.sol/VaultBTC.json ../frontend/src/contracts/abis/
cp artifacts/contracts/MockAave.sol/MockAave.json ../frontend/src/contracts/abis/
cp artifacts/contracts/OracleEMA.sol/OracleEMA.json ../frontend/src/contracts/abis/
cp artifacts/contracts/LeverageStrategy.sol/LeverageStrategy.json ../frontend/src/contracts/abis/
cp artifacts/contracts/StrategyFactory.sol/StrategyFactory.json ../frontend/src/contracts/abis/
```

### 2. Update Contract Addresses

In `frontend/src/contracts/addresses.ts`:

```typescript
export const CONTRACTS = {
  VaultBTC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  MockAave: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  OracleEMA: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  StrategyFactory: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
}
```

### 3. Use in Frontend

```typescript
import { ethers } from 'ethers'
import FactoryABI from '@/contracts/abis/StrategyFactory.json'
import { CONTRACTS } from '@/contracts/addresses'

const factory = new ethers.Contract(
  CONTRACTS.StrategyFactory,
  FactoryABI.abi,
  signer
)
```

## Testing

### Contract Tests

```bash
cd vault-contracts
npm test                    # Run all tests
npm test test/VaultBTC.t.ts # Run specific test
```

### Frontend Tests (when implemented)

```bash
cd frontend
npm test
```

## Deployment

### Local Network

```bash
# Terminal 1: Hardhat node
cd vault-contracts
npx hardhat node

# Terminal 2: Deploy
npm run deploy:local

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Testnet (e.g., Sepolia)

```bash
# Deploy contracts
cd vault-contracts
npx hardhat run scripts/deploy.ts --network sepolia

# Update frontend .env with new addresses
cd frontend
# Edit .env

# Build and deploy frontend
npm run build
# Deploy dist/ to hosting service
```

## Troubleshooting

### "Module not found"

```bash
# Reinstall dependencies
cd vault-contracts
npm install

cd ../frontend
npm install
```

### "Contract not deployed"

```bash
# Redeploy contracts
cd vault-contracts
npm run deploy:local
# Update frontend addresses
```

### "Hardhat not found"

```bash
# Make sure you're in vault-contracts directory
cd vault-contracts
npx hardhat --version
```

### TypeScript Errors

```bash
# Rebuild contracts
cd vault-contracts
npm run build

# Regenerate types
cd ../frontend
npm run build
```

## Best Practices

### 1. Keep ABIs in Sync

After any contract changes:
1. Rebuild contracts
2. Copy new ABIs to frontend
3. Update addresses if redeployed

### 2. Use Environment Variables

Never hardcode addresses or private keys:
- Use `.env` files
- Add `.env` to `.gitignore`
- Use `.env.example` for templates

### 3. Version Control

```bash
# Commit contracts and frontend separately
git add vault-contracts/
git commit -m "feat(contracts): add new feature"

git add frontend/
git commit -m "feat(frontend): add new UI component"
```

### 4. Documentation

Keep documentation updated:
- Contract changes → Update vault-contracts/README.md
- Frontend changes → Update frontend/README.md
- Architecture changes → Update .kiro/steering/

## Scripts Reference

### Root Package.json Scripts

| Script | Description |
|--------|-------------|
| `contracts:install` | Install contract dependencies |
| `contracts:build` | Compile contracts |
| `contracts:test` | Run contract tests |
| `contracts:deploy` | Deploy to local network |
| `contracts:simulate` | Run simulation |
| `frontend:install` | Install frontend dependencies |
| `frontend:dev` | Start frontend dev server |
| `frontend:build` | Build frontend for production |
| `install:all` | Install all dependencies |
| `build:all` | Build contracts and frontend |
| `dev` | Start both contracts and frontend |

## Additional Resources

- [vault-contracts/README.md](vault-contracts/README.md) - Contract documentation
- [vault-contracts/SCRIPTS.md](vault-contracts/SCRIPTS.md) - Script guide
- [vault-contracts/TESTING.md](vault-contracts/TESTING.md) - Testing guide
- [frontend/SETUP.md](frontend/SETUP.md) - Frontend setup
- [RESTRUCTURE.md](RESTRUCTURE.md) - Restructure guide

## Next Steps

1. ✅ Restructure project
2. ✅ Install dependencies
3. ✅ Build and test contracts
4. 🚧 Set up frontend
5. ⏳ Implement wallet connection
6. ⏳ Build vault management UI
7. ⏳ Add oracle monitoring
8. ⏳ Create dashboard
9. ⏳ Deploy to testnet

---

**Need Help?** Check the documentation in each directory or create an issue.
