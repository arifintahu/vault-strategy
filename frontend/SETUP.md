# Frontend Setup Guide

## Initial Setup

### 1. Create Vite + React + TypeScript Project

```bash
cd frontend
npm create vite@latest . -- --template react-ts
```

When prompted, confirm to proceed in the current directory.

### 2. Install Dependencies

```bash
# Core dependencies
npm install

# Ethereum libraries
npm install ethers@^6.9.0

# Wallet connection
npm install wagmi viem @tanstack/react-query

# UI libraries (optional)
npm install @headlessui/react @heroicons/react
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Additional utilities
npm install clsx date-fns
```

### 3. Project Structure

Create the following structure:

```
frontend/
├── src/
│   ├── components/
│   │   ├── wallet/
│   │   │   ├── ConnectWallet.tsx
│   │   │   └── WalletInfo.tsx
│   │   ├── vault/
│   │   │   ├── CreateVault.tsx
│   │   │   ├── VaultList.tsx
│   │   │   ├── VaultDetails.tsx
│   │   │   └── VaultActions.tsx
│   │   ├── oracle/
│   │   │   ├── OracleStatus.tsx
│   │   │   └── PriceChart.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Layout.tsx
│   ├── hooks/
│   │   ├── useContracts.ts
│   │   ├── useVault.ts
│   │   ├── useOracle.ts
│   │   └── useAave.ts
│   ├── utils/
│   │   ├── contracts.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   ├── contracts/
│   │   ├── abis/
│   │   │   ├── VaultBTC.json
│   │   │   ├── MockAave.json
│   │   │   ├── OracleEMA.json
│   │   │   ├── LeverageStrategy.json
│   │   │   └── StrategyFactory.json
│   │   └── addresses.ts
│   ├── types/
│   │   └── contracts.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Configuration Files

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
})
```

### tsconfig.json (update)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Copy Contract ABIs

After building contracts, copy the ABIs:

```bash
# From root directory
cp vault-contracts/artifacts/contracts/VaultBTC.sol/VaultBTC.json frontend/src/contracts/abis/
cp vault-contracts/artifacts/contracts/MockAave.sol/MockAave.json frontend/src/contracts/abis/
cp vault-contracts/artifacts/contracts/OracleEMA.sol/OracleEMA.json frontend/src/contracts/abis/
cp vault-contracts/artifacts/contracts/LeverageStrategy.sol/LeverageStrategy.json frontend/src/contracts/abis/
cp vault-contracts/artifacts/contracts/StrategyFactory.sol/StrategyFactory.json frontend/src/contracts/abis/
```

## Environment Variables

Create `.env` file:

```env
VITE_CHAIN_ID=31337
VITE_RPC_URL=http://127.0.0.1:8545
VITE_FACTORY_ADDRESS=0x...
VITE_VAULTBTC_ADDRESS=0x...
VITE_AAVE_ADDRESS=0x...
VITE_ORACLE_ADDRESS=0x...
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Next Steps

1. Set up Wagmi configuration
2. Create wallet connection component
3. Implement contract hooks
4. Build vault management UI
5. Add oracle monitoring
6. Create dashboard

See the main README.md for more details.
