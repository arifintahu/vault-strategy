---
inclusion: always
---

# TypeScript Configuration

## Setup

All JavaScript files have been migrated to TypeScript for better type safety and developer experience.

## Configuration Files

- `tsconfig.json` - TypeScript compiler configuration
- `hardhat.config.ts` - Hardhat configuration in TypeScript
- Target: ES2020, Module: CommonJS

## Dependencies

```json
{
  "@types/chai": "^4.3.11",
  "@types/mocha": "^10.0.6",
  "@types/node": "^20.10.6",
  "ts-node": "^10.9.2",
  "typescript": "^5.3.3"
}
```

## Type Safety

### Contract Types
- Import contract types from `typechain-types`
- Generated automatically on compile
- Example: `import { VaultBTC, LeverageStrategy } from "../typechain-types"`

### Signer Types
- Use `HardhatEthersSigner` from `@nomicfoundation/hardhat-ethers/signers`
- Provides type-safe signer interface

### BigInt Handling
- Use explicit bigint literals: `10000n` instead of `10000`
- Chai assertions with bigint: `expect(value).to.equal(10000n)`

## File Structure

```
├── scripts/
│   └── deploy.ts          # TypeScript deployment script
├── test/
│   └── Strategy.t.ts      # TypeScript test file
├── hardhat.config.ts      # TypeScript config
└── tsconfig.json          # TypeScript compiler config
```

## Best Practices

- Always type function parameters and return values
- Use `async/await` with proper Promise typing
- Import types explicitly for better IDE support
- Use `beforeEach` in tests for setup to avoid duplication
- Type helper functions (e.g., `toInt(n: number): bigint`)
