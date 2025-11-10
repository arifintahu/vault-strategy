import { ConnectWallet } from '../wallet/ConnectWallet';

export const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>Vault Strategy</h1>
            <span className="tagline">Automated BTC Leverage Management</span>
          </div>
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};
