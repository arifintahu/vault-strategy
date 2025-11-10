---
inclusion: always
---

# Development Guide

## Tech Stack

### Build System & Framework
- **Hardhat** - Ethereum development environment
- **Solidity 0.8.24** - Smart contract language
- **TypeScript** - Type-safe JavaScript
- **Hardhat Toolbox** - Testing and deployment utilities

### Testing & Types
- **Mocha** - Test framework (60s timeout configured)
- **Chai** - Assertion library
- **Ethers.js** - Ethereum library for contract interaction
- **Typechain** - TypeScript bindings for contracts

### Compiler Settings

```javascript
solidity: {
  version: "0.8.24",
  settings: { 
    optimizer: { enabled: true, runs: 200 } 
  }
}
```

## Common Commands

```bash
# Install dependencies
npm i

# Compile contracts (generates typechain types)
npm run build
# or: npx hardhat compile

# Run tests
npm test
# or: npx hardhat test

# Deploy to local network
npm run deploy:local
# or: npx hardhat run scripts/deploy.ts

# Clean artifacts
npx hardhat clean
```

## TypeScript Configuration

### Setup
All JavaScript files have been migrated to TypeScript for better type safety and developer experience.

### Configuration Files
- `tsconfig.json` - TypeScript compiler configuration
- `hardhat.config.ts` - Hardhat configuration in TypeScript
- Target: ES2020, Module: CommonJS

### Dependencies

```json
{
  "@types/chai": "^4.3.11",
  "@types/mocha": "^10.0.6",
  "@types/node": "^20.10.6",
  "ts-node": "^10.9.2",
  "typescript": "^5.3.3"
}
```

### Type Safety

**Contract Types**
- Import contract types from `typechain-types`
- Generated automatically on compile
- Example: `import { VaultBTC, LeverageStrategy } from "../typechain-types"`

**Signer Types**
- Use `HardhatEthersSigner` from `@nomicfoundation/hardhat-ethers/signers`
- Provides type-safe signer interface

**BigInt Handling**
- Use explicit bigint literals: `10000n` instead of `10000`
- Chai assertions with bigint: `expect(value).to.equal(10000n)`

### File Structure

```
├── scripts/
│   └── deploy.ts          # TypeScript deployment script
├── test/
│   └── Strategy.t.ts      # TypeScript test file
├── hardhat.config.ts      # TypeScript config
└── tsconfig.json          # TypeScript compiler config
```

## Code Conventions

### Solidity

**File Structure**
- Use SPDX license identifier: `// SPDX-License-Identifier: MIT`
- Pragma: `pragma solidity ^0.8.24;`
- Imports at top
- Interfaces before contracts

**Naming Conventions**
- Error messages: UPPERCASE_SNAKE_CASE (e.g., `"ONLY_OWNER"`, `"BAL_LOW"`)
- Events: PascalCase (e.g., `Deposit`, `Rebalance`, `VaultCreated`)
- Modifiers: camelCase (e.g., `onlyOwner`)
- Internal helpers: prefix with underscore (e.g., `_transfer`, `_clamp`)
- Public/external functions: camelCase
- State variables: camelCase

**Best Practices**
- Use `unchecked` blocks for safe arithmetic optimizations
- Immutable variables for constructor-set addresses
- Explicit visibility for all functions
- NatSpec comments for public/external functions
- Emit events for all state changes

### TypeScript/Testing

**Type Safety**
- Always type function parameters and return values
- Use `async/await` with proper Promise typing
- Import types explicitly for better IDE support
- Type helper functions (e.g., `toInt(n: number): bigint`)

**Testing Patterns**
- Use `beforeEach` for test setup to avoid duplication
- Helper functions for conversions (e.g., `toInt` for 8-decimal precision)
- BigInt for large numbers: `5n * 10n ** 8n`
- Always `await` deployment: `await contract.waitForDeployment()`
- Get addresses with: `await contract.getAddress()`
- Explicit bigint comparisons: `expect(value).to.equal(10000n)`

**Test Structure**
```typescript
describe("Contract Name", function () {
  let contract: ContractType;
  let owner: HardhatEthersSigner;
  
  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    // Setup contracts
  });
  
  it("should do something", async function () {
    // Test logic
  });
});
```

## Numeric Precision

### Basis Points (BPS)
- 10000 = 1.0x leverage
- 11000 = 1.1x leverage
- 15000 = 1.5x leverage
- Used for leverage calculations

### Token Decimals
- **vBTC Token**: 8 decimals (BTC-style precision)
- **Price/Oracle**: 8 decimals
- Helper: `toInt(n: number): bigint => BigInt(Math.floor(n * 1e8))`

### Examples
```typescript
const toInt = (n: number): bigint => BigInt(Math.floor(n * 1e8));

// 5 vBTC
const amount = 5n * 10n ** 8n;

// Price: $60,000
const price = toInt(60000);

// Leverage: 1.3x
const leverage = 13000n; // in BPS
```

## Development Workflow

### 1. Make Changes
- Edit Solidity contracts in `contracts/`
- Update tests in `test/`
- Update deployment script in `scripts/`

### 2. Compile
```bash
npm run build
```
This generates:
- Contract artifacts in `artifacts/`
- TypeScript types in `typechain-types/`

### 3. Test
```bash
npm test
```
Run specific test:
```bash
npx hardhat test test/Strategy.t.ts
```

### 4. Deploy Locally
```bash
npm run deploy:local
```

### 5. Check Diagnostics
Use IDE diagnostics or:
```bash
npx hardhat compile
```

## Troubleshooting

### TypeScript Errors
- Run `npm run build` to regenerate typechain types
- Check `tsconfig.json` configuration
- Ensure all dependencies are installed

### Contract Compilation Errors
- Check Solidity version matches `hardhat.config.ts`
- Verify all imports are correct
- Run `npx hardhat clean` then `npm run build`

### Test Failures
- Check BigInt comparisons use `n` suffix
- Verify contract addresses with `await contract.getAddress()`
- Ensure proper `await` on all async operations
- Check event emissions and revert messages

## Best Practices

### TypeScript
- Always type function parameters and return values
- Use `async/await` with proper Promise typing
- Import types explicitly for better IDE support
- Use `beforeEach` in tests for setup to avoid duplication
- Type helper functions explicitly

### Solidity
- Keep functions small and focused
- Use modifiers for access control
- Emit events for all state changes
- Add NatSpec comments for public functions
- Use immutable for constructor-set values
- Prefer explicit over implicit

### Testing
- Test happy paths and edge cases
- Verify access control restrictions
- Check event emissions
- Test with multiple users/scenarios
- Use descriptive test names
