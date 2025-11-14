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
        <h3>🏦 Vault {formatAddress(vault.address)}</h3>
        <span className={`risk-badge risk-${state.risk}`}>
          {state.risk === 0 ? '🛡️' : state.risk === 1 ? '⚖️' : '🔥'} {RISK_TIER_NAMES[state.risk]}
        </span>
      </div>
      <div className="card-body">
        <div className="vault-stats">
          <div className="stat">
            <label>💰 Vault Balance</label>
            <div className="value">{formatBTC(state.vaultBalance)} vBTC</div>
            <small className="hint">Idle, withdrawable</small>
          </div>
          <div className="stat">
            <label>🏛️ Supplied to Aave</label>
            <div className="value">{formatBTC(state.suppliedToAave)} vBTC</div>
            <small className="hint">Earning yield</small>
          </div>
          <div className="stat">
            <label>📊 BTC Position</label>
            <div className="value">{formatBTC(state.btcPosition)} vBTC</div>
            <small className="hint">In Aave (with leverage)</small>
          </div>
          <div className="stat highlight">
            <label>✨ Total BTC Owned</label>
            <div className="value">{formatBTC(state.vaultBalance + state.btcPosition)} vBTC</div>
            <small className="hint">Vault + Position</small>
          </div>
          <div className="stat">
            <label>💳 Borrowed</label>
            <div className="value">${formatUSD(state.borrowedFromAave)}</div>
          </div>
          <div className="stat">
            <label>⚡ Leverage</label>
            <div className="value leverage">{formatLeverage(state.currentLeverageBps)}</div>
          </div>
          <div className="stat">
            <label>📈 Avg Price</label>
            <div className="value">
              {state.avgBtcPrice > 0n ? `$${formatUSD(state.avgBtcPrice)}` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
