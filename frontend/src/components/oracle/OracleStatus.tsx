import { useOracle } from '../../hooks/useOracle';
import { formatUSD } from '../../utils/formatting';
import { SIGNAL_NAMES } from '../../types/contracts';

export const OracleStatus = () => {
  const { oracleData, loading, error, refresh } = useOracle();

  if (loading) return <div className="loading">Loading oracle data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!oracleData) return null;

  const getSignalColor = (signal: number) => {
    if (signal >= 1) return 'bullish';
    if (signal <= -1) return 'bearish';
    return 'neutral';
  };

  return (
    <div className="oracle-status card">
      <div className="card-header">
        <h2>Oracle Status</h2>
        <button onClick={refresh} className="btn btn-sm">
          Refresh
        </button>
      </div>
      <div className="card-body">
        <div className="oracle-grid">
          <div className="oracle-item">
            <label>Current Price</label>
            <div className="value price">${formatUSD(oracleData.price)}</div>
          </div>
          <div className="oracle-item">
            <label>EMA 20-day</label>
            <div className="value">${formatUSD(oracleData.ema20)}</div>
          </div>
          <div className="oracle-item">
            <label>EMA 50-day</label>
            <div className="value">${formatUSD(oracleData.ema50)}</div>
          </div>
          <div className="oracle-item">
            <label>EMA 200-day</label>
            <div className="value">${formatUSD(oracleData.ema200)}</div>
          </div>
        </div>
        <div className={`signal-indicator ${getSignalColor(oracleData.signal)}`}>
          <label>Market Signal</label>
          <div className="signal-value">
            {SIGNAL_NAMES[oracleData.signal]}
          </div>
        </div>
      </div>
    </div>
  );
};
