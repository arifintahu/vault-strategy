import { useState } from 'react';
import { getSigner, getVaultBTCContract, getLeverageStrategyContract } from '../../utils/contracts';
import type { UserVault } from '../../types/contracts';
import { toInt } from '../../utils/formatting';

interface VaultActionsProps {
  vault: UserVault;
  onActionComplete: () => void;
}

export const VaultActions = ({ vault, onActionComplete }: VaultActionsProps) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const signer = await getSigner();
      const vbtc = getVaultBTCContract(signer);
      const strategy = getLeverageStrategyContract(vault.address, signer);

      const amountBigInt = toInt(Number(amount));

      // Approve
      const approveTx = await vbtc.approve(vault.address, amountBigInt);
      await approveTx.wait();

      // Deposit
      const depositTx = await strategy.deposit(amountBigInt);
      await depositTx.wait();

      setSuccess('Deposit successful!');
      setAmount('');
      setTimeout(() => {
        onActionComplete();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSupplyToAave = async () => {
    if (!amount || Number(amount) <= 0) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const signer = await getSigner();
      const strategy = getLeverageStrategyContract(vault.address, signer);

      const amountBigInt = toInt(Number(amount));
      const tx = await strategy.supplyToAave(amountBigInt);
      await tx.wait();

      setSuccess('Supplied to Aave successfully!');
      setAmount('');
      setTimeout(() => {
        onActionComplete();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRebalance = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const signer = await getSigner();
      const strategy = getLeverageStrategyContract(vault.address, signer);

      const tx = await strategy.rebalance();
      await tx.wait();

      setSuccess('Rebalance successful!');
      setTimeout(() => {
        onActionComplete();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const signer = await getSigner();
      const strategy = getLeverageStrategyContract(vault.address, signer);

      const amountBigInt = toInt(Number(amount));
      const tx = await strategy.withdraw(amountBigInt);
      await tx.wait();

      setSuccess('Withdrawal successful!');
      setAmount('');
      setTimeout(() => {
        onActionComplete();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="vault-actions card">
      <div className="card-header">
        <h3>Vault Actions</h3>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label>Amount (vBTC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.0001"
            min="0"
            className="input"
          />
        </div>

        <div className="action-buttons">
          <button
            onClick={handleDeposit}
            disabled={isProcessing || !amount}
            className="btn btn-primary"
          >
            Deposit
          </button>
          <button
            onClick={handleSupplyToAave}
            disabled={isProcessing || !amount}
            className="btn btn-primary"
          >
            Supply to Aave
          </button>
          <button
            onClick={handleWithdraw}
            disabled={isProcessing || !amount}
            className="btn btn-secondary"
          >
            Withdraw
          </button>
          <button
            onClick={handleRebalance}
            disabled={isProcessing}
            className="btn btn-accent"
          >
            Rebalance
          </button>
        </div>

        {error && <div className="error mt-2">{error}</div>}
        {success && <div className="success mt-2">{success}</div>}
      </div>
    </div>
  );
};
