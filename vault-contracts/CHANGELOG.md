# Changelog

## [0.2.0] - 2024-11-14

### Added

#### New Features
- **Vault Balance Accounting**: Separated vault balance from supplied balance
  - `vaultBalance`: Idle BTC in vault (immediately withdrawable)
  - `suppliedToAave`: BTC supplied to Aave as collateral (earning yield)
  - `btcPosition`: Total BTC position tracking

- **withdrawFromAave() Function**: Withdraw BTC from Aave back to vault balance
  - Only works when no debt exists
  - Moves funds from Aave to vault for immediate withdrawal
  - Maintains proper accounting separation

- **repayDebt() Function**: Manual debt repayment
  - Sells BTC to repay USD debt
  - Uses vault balance first, then supplied balance
  - Simulates DEX interaction for demo purposes
  - Proper health factor management

#### Testing
- Added 6 new vault balance accounting tests
- Added 4 new debt repayment tests
- Created comprehensive integration test script
- All 119 tests passing

#### Documentation
- `NEW_FEATURES.md`: Comprehensive feature documentation
- `QUICK_START.md`: Developer quick start guide
- `CHANGELOG.md`: Version history
- Updated `VAULT_ACCOUNTING.md`: Detailed accounting model
- Updated `REPAY_DEBT_FEATURE.md`: Debt management details

#### Scripts
- `test-integration.ts`: Full lifecycle integration test
- Added npm scripts for specific test suites
  - `npm run test:integration`
  - `npm run test:repay`
  - `npm run test:accounting`

### Changed

#### Contract Updates
- **LeverageStrategy.sol**:
  - Fixed `supplyToAave()` to deduct from vault balance
  - Fixed `withdraw()` to only use vault balance
  - Updated `rebalance()` to properly track BTC position
  - Improved accounting in all functions

#### Test Updates
- Updated all vault balance tests to match new accounting
- Fixed test expectations for proper balance tracking
- Added edge case coverage

### Fixed
- Vault balance vs supplied balance confusion
- Incorrect BTC position tracking
- Health factor issues during debt repayment
- Withdrawal logic when funds are in Aave

### Security
- Added debt checks before Aave withdrawals
- Proper balance validation in all functions
- Owner-only access for sensitive operations
- Health factor enforcement

## [0.1.0] - 2024-11-13

### Initial Release
- Basic vault strategy with EMA oracle
- Aave integration for lending/borrowing
- Automatic rebalancing based on market signals
- Risk tier system (Low, Medium, High)
- Factory pattern for vault creation
- VaultBTC token implementation
- MockAave for testing
- OracleEMA for price signals

---

## Migration Guide

### From v0.1.0 to v0.2.0

#### Contract Changes
No breaking changes to existing functions. New functions added:
- `withdrawFromAave(uint256 amount)`
- `repayDebt(uint256 btcAmount)`

#### State Structure
The `getVaultState()` return values remain the same, but accounting is now more accurate:
```solidity
// Before: vaultBalance included supplied funds
// After: vaultBalance only includes idle funds

struct VaultState {
    uint256 vaultBalance;      // Now: only idle BTC
    uint256 suppliedToAave;    // Now: properly tracked
    uint256 borrowedFromAave;  // Unchanged
    uint256 btcPosition;       // Now: accurate total position
    uint256 currentLeverageBps; // Unchanged
}
```

#### Frontend Updates Needed
1. Update UI to show vault balance vs supplied balance separately
2. Add "Repay Debt" button when debt exists
3. Add "Withdraw from Aave" button when no debt
4. Update balance displays to reflect new accounting

#### Testing
All existing tests updated and passing. Run:
```bash
npm test
```

---

## Roadmap

### v0.3.0 (Planned)
- [ ] Frontend UI updates for new features
- [ ] Transaction history tracking
- [ ] Event logging improvements
- [ ] Gas optimization
- [ ] Additional risk management features

### v0.4.0 (Planned)
- [ ] Multi-asset support
- [ ] Advanced rebalancing strategies
- [ ] Automated debt management
- [ ] Performance analytics dashboard

### v1.0.0 (Planned)
- [ ] Mainnet deployment
- [ ] Security audit
- [ ] Production-ready frontend
- [ ] Comprehensive documentation
- [ ] User guides and tutorials

---

## Support

For questions or issues:
1. Check documentation in `/vault-contracts/`
2. Review test files for examples
3. Run integration test: `npm run test:integration`

## Contributors

- Development Team
- Testing Team
- Documentation Team
