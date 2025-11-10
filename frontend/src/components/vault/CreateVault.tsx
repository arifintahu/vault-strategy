import { useState } from 'react';
import { getSigner, getStrategyFactoryContract } from '../../utils/contracts';
import { RiskTier, RISK_TIER_NAMES } from '../../types/contracts';
import type { RiskTierType } from '../../types/contracts';

interface CreateVaultProps {
  onVaultCreated: () => void;
}

export const CreateVault = ({ onVaultCreated }: CreateVaultProps) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskTierType>(RiskTier.Medium);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const signer = await getSigner();
      const factory = getStrategyFactoryContract(signer);

      const tx = await factory.createVault(selectedRisk);
      await tx.wait();

      setSuccess(true);
      setTimeout(() => {
        onVaultCreated();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="create-vault card">
      <div className="card-header">
        <h2>Create New Vault</h2>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label>Select Risk Tier</label>
          <div className="risk-options">
            {Object.entries(RISK_TIER_NAMES).map(([key, name]) => (
              <label key={key} className="radio-option">
                <input
                  type="radio"
                  name="risk"
                  value={key}
                  checked={selectedRisk === Number(key)}
                  onChange={(e) => setSelectedRisk(Number(e.target.value) as RiskTierType)}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="btn btn-primary btn-block"
        >
          {isCreating ? 'Creating Vault...' : 'Create Vault'}
        </button>

        {error && <div className="error mt-2">{error}</div>}
        {success && <div className="success mt-2">Vault created successfully!</div>}
      </div>
    </div>
  );
};
