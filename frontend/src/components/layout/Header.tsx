import { useState } from 'react';
import { ConnectWallet } from '../wallet/ConnectWallet';
import { FaucetModal } from '../faucet/FaucetModal';

export const Header = () => {
  const [showFaucet, setShowFaucet] = useState(false);

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>🚀 Vault Strategy</h1>
              <span className="tagline">Automated BTC Leverage • EMA Signals • Aave Protocol</span>
            </div>
            <div className="header-actions">
              <button 
                onClick={() => setShowFaucet(true)} 
                className="btn btn-sm btn-accent"
              >
                💧 Faucet
              </button>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>
      
      {showFaucet && <FaucetModal onClose={() => setShowFaucet(false)} />}
    </>
  );
};
