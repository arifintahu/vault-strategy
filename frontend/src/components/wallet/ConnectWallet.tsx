import { useWallet } from '../../hooks/useWallet';
import { formatAddress } from '../../utils/formatting';

export const ConnectWallet = () => {
  const { account, isConnecting, error, connect, disconnect, isConnected } = useWallet();

  return (
    <div className="connect-wallet">
      {!isConnected ? (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="btn btn-primary"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="address">{formatAddress(account!)}</span>
          <button onClick={disconnect} className="btn btn-secondary">
            Disconnect
          </button>
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
};
