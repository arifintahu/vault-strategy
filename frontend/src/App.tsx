import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { OracleStatus } from './components/oracle/OracleStatus';
import { CreateVault } from './components/vault/CreateVault';
import { VaultList } from './components/vault/VaultList';
import { VaultActions } from './components/vault/VaultActions';
import { useWallet } from './hooks/useWallet';
import { useVaults } from './hooks/useVaults';
import type { UserVault } from './types/contracts';
import './App.css';

function App() {
  const { account } = useWallet();
  const { vaults, loading, error, refresh } = useVaults(account);
  const [selectedVault, setSelectedVault] = useState<UserVault | null>(null);

  const handleVaultCreated = () => {
    refresh();
  };

  const handleActionComplete = () => {
    refresh();
    setSelectedVault(null);
  };

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          {account && <p className="subtitle">Manage your leverage strategy vaults</p>}
        </div>

        <div className="dashboard-grid">
          {/* Oracle Status */}
          <div className="grid-item full-width">
            <OracleStatus />
          </div>

          {/* Create Vault */}
          {account && (
            <div className="grid-item">
              <CreateVault onVaultCreated={handleVaultCreated} />
            </div>
          )}

          {/* Vault Actions */}
          {selectedVault && (
            <div className="grid-item">
              <VaultActions vault={selectedVault} onActionComplete={handleActionComplete} />
            </div>
          )}

          {/* Vault List */}
          <div className="grid-item full-width">
            <VaultList 
              account={account} 
              vaults={vaults}
              loading={loading}
              error={error}
              onSelectVault={setSelectedVault} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
