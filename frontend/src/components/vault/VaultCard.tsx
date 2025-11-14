import { RISK_TIER_NAMES } from '../../types/contracts';
import type { UserVault } from '../../types/contracts';
import { formatBTC, formatUSD, formatLeverage, formatAddress } from '../../utils/formatting';

interface VaultCardProps {
  vault: UserVault;
  onSelect: (vault: UserVault) => void;
}

export const VaultCard = ({ vault, onSelect }: VaultCardProps) => {
  const { state } = vault;

  return (
    <div className="vault-card card" onClick={() => onSelect(vault)}>
      <div className="card-header">
        <h3>Vault {formatAddress(vault.address)}</h3>
        <span className={`risk-badge risk-${state.risk}`}>
          {RISK_TIER_NAMES[state.risk]}
        </span>
      </div>
      <div className="card-body">
        <div className="vault-stats">
          <div className="stat">
            <label>Vault Balance (Idle)</label>
            <div className="value">{formatBTC(state.vaultBalance)} vBTC</div>
            <small className="hint">Immediately withdrawable</small>
          </div>
          <div className="stat">
            <label>Supplied to Aave</label>
            <div className="value">{formatBTC(state.suppliedToAave)} vBTC</div>
            <small className="hint">Earning yield, used as collateral</small>
          </div>
          <div className="stat">
            <label>BTC Position (in Aave)</label>
            <div className="value">{formatBTC(state.btcPosition)} vBTC</div>
            <small className="hint">Supplied + borrowed exposure</small>
          </div>
          <div className="stat highlight">
            <label>Total BTC Owned</label>
            <div className="value">{formatBTC(state.vaultBalance + state.btcPosition)} vBTC</div>
            <small className="hint">Vault + Position (with leverage)</small>
          </div>
          <div className="stat">
            <label>Borrowed</label>
            <div className="value">${formatUSD(state.borrowedFromAave)}</div>
          </div>
          <div className="stat">
            <label>Current Leverage</label>
            <div className="value leverage">{formatLeverage(state.currentLeverageBps)}</div>
          </div>
          <div className="stat">
            <label>Avg BTC Price</label>
            <div className="value">
              {state.avgBtcPrice > 0n ? `$${formatUSD(state.avgBtcPrice)}` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
