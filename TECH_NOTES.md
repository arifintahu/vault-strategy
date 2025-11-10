
# Short Technical Notes

- **Token Assumption**: `vaultBTC` is an ERC20 minted/burned by a Bitcoin trustless vault bridge. In the demo we use a local ERC20 stub.
- **Rebalance Logic**: compares spot price to MA bands:
  - `price < lower` → `targetLeverage += step` up to `max` (risk tier).
  - `price > upper` → `targetLeverage -= step` down to 1.0x.
  - Steps: 0.05x (Low), 0.1x (Med/High); Max: 1.1x/1.3x/1.5x.
- **Execution Split**: Strategy only sets **intent**. A separate adapter module (off-chain keeper or on-chain bot) executes on DEX/Perp and reports fills.
- **Extending to Real Perps**: add `IAdapter.executeTargetLeverage(targetBps)`; adapter computes required delta (buy/sell), enforces slippage, submits trades, and stores fill data for PnL.
- **Porting**: swap `VaultBTC` address to the real bridge token; keep-oracle & adapter stack identical. Bitcoin redemption is independent from the strategy logic.
