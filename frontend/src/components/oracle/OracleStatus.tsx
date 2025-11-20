import { useOracle } from '../../hooks/useOracle';
import { formatUSD } from '../../utils/formatting';
import { SIGNAL_NAMES } from '../../types/contracts';

export const OracleStatus = () => {
  const { oracleData, loading, error, refresh } = useOracle();

  if (!oracleData && loading) return <div className="loading">Loading oracle data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!oracleData) return null;

  const getSignalColor = (signal: number) => {
    if (signal >= 1) return 'bullish';
    if (signal <= -1) return 'bearish';
    return 'neutral';
  };

  return (
    <div className="oracle-status card" style={{ animation: 'none' }}>
      <div className="card-header">
        <h2>📊 Market Analytics</h2>
        <button onClick={refresh} className="btn btn-sm btn-secondary">
          🔄 Refresh
        </button>
      </div>
      <div className="card-body">
        <div className="oracle-grid">
          <div className="oracle-item" style={{ animation: 'none' }}>
            <label>BTC Price</label>
            <div className="value price" key={oracleData.price.toString()}>
              ${formatUSD(oracleData.price)}
            </div>
          </div>
          <div className="oracle-item" style={{ animation: 'none' }}>
            <label>EMA-20</label>
            <div className="value" key={oracleData.ema20.toString()}>
              ${formatUSD(oracleData.ema20)}
            </div>
          </div>
          <div className="oracle-item" style={{ animation: 'none' }}>
            <label>EMA-50</label>
            <div className="value" key={oracleData.ema50.toString()}>
              ${formatUSD(oracleData.ema50)}
            </div>
          </div>
          <div className="oracle-item" style={{ animation: 'none' }}>
            <label>EMA-200</label>
            <div className="value" key={oracleData.ema200.toString()}>
              ${formatUSD(oracleData.ema200)}
            </div>
          </div>
        </div>
        <div className={`signal-indicator ${getSignalColor(oracleData.signal)}`}>
          <label>Market Signal</label>
          <div className="signal-value">
            {oracleData.signal >= 1 ? '📈 ' : oracleData.signal <= -1 ? '📉 ' : '➡️ '}
            {SIGNAL_NAMES[oracleData.signal]}
          </div>
        </div>
      </div>
    </div>
  );
};
