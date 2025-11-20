import { useState } from 'react';
import { getStrategyFactoryContract } from '../../utils/contracts';
import { RiskTier } from '../../types/contracts';
import type { RiskTierType } from '../../types/contracts';
import { useSigner } from '../../hooks/useSigner';

interface CreateVaultProps {
  onVaultCreated: () => void;
}

export const CreateVault = ({ onVaultCreated }: CreateVaultProps) => {
  const signer = useSigner();
  const [selectedRisk, setSelectedRisk] = useState<RiskTierType>(RiskTier.Medium);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (!signer) return;

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const signerInstance = await signer;
      const factory = getStrategyFactoryContract(signerInstance);

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
            <label className="radio-option">
              <input
                type="radio"
                name="risk"
                value={RiskTier.Low}
                checked={selectedRisk === RiskTier.Low}
                onChange={(e) => setSelectedRisk(Number(e.target.value) as RiskTierType)}
              />
              <label>🛡️ Low Risk</label>
              <div className="risk-details">Max 1.1x leverage</div>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="risk"
                value={RiskTier.Medium}
                checked={selectedRisk === RiskTier.Medium}
                onChange={(e) => setSelectedRisk(Number(e.target.value) as RiskTierType)}
              />
              <label>⚖️ Medium Risk</label>
              <div className="risk-details">Max 1.3x leverage</div>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="risk"
                value={RiskTier.High}
                checked={selectedRisk === RiskTier.High}
                onChange={(e) => setSelectedRisk(Number(e.target.value) as RiskTierType)}
              />
              <label>🔥 High Risk</label>
              <div className="risk-details">Max 1.5x leverage</div>
            </label>
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
