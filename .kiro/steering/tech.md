---
inclusion: always
---

# Tech Stack

## Build System & Framework

- **Hardhat** - Ethereum development environment
- **Solidity 0.8.24** - Smart contract language
- **Hardhat Toolbox** - Testing and deployment utilities

## Compiler Settings

```javascript
solidity: {
  version: "0.8.24",
  settings: { 
    optimizer: { enabled: true, runs: 200 } 
  }
}
```

## Testing

- **TypeScript** - Type-safe JavaScript
- **Mocha** - Test framework (60s timeout configured)
- **Chai** - Assertion library
- **Ethers.js** - Ethereum library for contract interaction
- **Typechain** - TypeScript bindings for contracts

## Common Commands

```bash
# Install dependencies
npm i

# Compile contracts
npm run build
# or: hardhat compile

# Run tests
npm test
# or: hardhat test

# Deploy to local network
npm run deploy:local
# or: hardhat run scripts/deploy.js
```

## Code Conventions

### Solidity

- Use SPDX license identifier: `// SPDX-License-Identifier: MIT`
- Pragma: `pragma solidity ^0.8.24;`
- Error messages: Use UPPERCASE_SNAKE_CASE (e.g., `"ONLY_OWNER"`, `"BAL_LOW"`)
- Events: PascalCase (e.g., `Deposit`, `Rebalance`, `Intent`)
- Modifiers: camelCase (e.g., `onlyOwner`)
- Internal helpers: prefix with underscore (e.g., `_transfer`, `_clamp`)
- Use `unchecked` blocks for safe arithmetic optimizations
- Immutable variables for constructor-set addresses

### TypeScript/Testing

- Use TypeScript for all scripts and tests
- Type imports from `typechain-types` for contract instances
- Use `async/await` for contract interactions
- Helper functions for conversions (e.g., `toInt` for 8-decimal precision)
- BigInt for large numbers: `5n * 10n ** 8n`
- Always `await` deployment: `await contract.waitForDeployment()`
- Get addresses with: `await contract.getAddress()`
- Use `HardhatEthersSigner` type for signers
- Explicit bigint comparisons: `expect(value).to.equal(10000n)`

## Numeric Precision

- **Basis Points (BPS)**: 10000 = 1.0x leverage, 15000 = 1.5x
- **Price/Oracle**: 8 decimals (BTC-style precision)
- **vBTC Token**: 8 decimals
