import { useVaults } from '../../hooks/useVaults';
import { VaultCard } from './VaultCard';
import type { UserVault } from '../../types/contracts';

interface VaultListProps {
  account: string | null;
  onSelectVault: (vault: UserVault) => void;
}

export const VaultList = ({ account, onSelectVault }: VaultListProps) => {
  const { vaults, loading, error } = useVaults(account);

  if (!account) {
    return (
      <div className="vault-list-empty">
        <p>Connect your wallet to view your vaults</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading vaults...</div>;
  }

  if (error) {
    return <div className="error">Error loading vaults: {error}</div>;
  }

  if (vaults.length === 0) {
    return (
      <div className="vault-list-empty">
        <p>You don't have any vaults yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="vault-list">
      <h2>Your Vaults ({vaults.length})</h2>
      <div className="vault-grid">
        {vaults.map((vault) => (
          <VaultCard key={vault.address} vault={vault} onSelect={onSelectVault} />
        ))}
      </div>
    </div>
  );
};
