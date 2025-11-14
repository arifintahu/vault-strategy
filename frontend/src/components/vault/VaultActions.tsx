import { useState, useEffect } from 'react';
import { getVaultBTCContract, getLeverageStrategyContract, getProvider } from '../../utils/contracts';
import type { UserVault } from '../../types/contracts';
import { toInt, formatBTC } from '../../utils/formatting';
import { useWallet } from '../../hooks/useWallet';
import { useSigner } from '../../hooks/useSigner';

interface VaultActionsProps {
  vault: UserVault;
  onActionComplete: () => void;
}

export const VaultActions = ({ vault, onActionComplete }: VaultActionsProps) => {
  const { account } = useWallet();
  const signer = useSigner();
  const [activeTab, setActiveTab] = useState<'deposit' | 'supply' | 'withdraw' | 'rebalance'>('deposit');
  const [amount, setAmount] = useState('');
  const [vbtcBalance, setVbtcBalance] = useState<bigint>(0n);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch vBTC balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account) return;
      
      try {
        const provider = getProvider();
        const vbtc = getVaultBTCContract(provider);
        const balance = await vbtc.balanceOf(account);
        setVbtcBalance(balance);
      } catch (err) {
        console.error('Error fetching vBTC balance:', err);
      }
    };

    fetchBalance();
    // Refresh balance every 5 seconds
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [account]);

  // Get max amount based on active tab
  const getMaxAmount = () => {
    switch (activeTab) {
      case 'deposit':
        return vbtcBalance; // User's vBTC balance
      case 'supply':
        return vault.state.vaultBalance; // Vault balance
      case 'withdraw':
        return vault.state.vaultBalance; // Vault balance
      default:
        return 0n;
    }
  };

  // Get available balance label
  const getBalanceLabel = () => {
    switch (activeTab) {
      case 'deposit':
        return `Available: ${formatBTC(vbtcBalance)} vBTC`;
      case 'supply':
        return `Vault Balance: ${formatBTC(vault.state.vaultBalance)} vBTC`;
      case 'withdraw':
        return `Vault Balance: ${formatBTC(vault.state.vaultBalance)} vBTC`;
      default:
        return '';
    }
  };

  const setMaxAmount = () => {
    setAmount(formatBTC(getMaxAmount()));
  };

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0 || !signer) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const signerInstance = await signer;
      const vbtc = getVaultBTCContract(signerInstance);
      const strategy = getLeverageStrategyContract(vault.address, signerInstance);

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
    if (!amount || Number(amount) <= 0 || !signer) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const signerInstance = await signer;
      const strategy = getLeverageStrategyContract(vault.address, signerInstance);

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
    if (!signer) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const signerInstance = await signer;
      const strategy = getLeverageStrategyContract(vault.address, signerInstance);

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
    if (!amount || Number(amount) <= 0 || !signer) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const signerInstance = await signer;
      const strategy = getLeverageStrategyContract(vault.address, signerInstance);

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
        <h3>⚡ Manage Vault</h3>
        <button onClick={onActionComplete} className="btn btn-sm">✕ Close</button>
      </div>
      <div className="card-body">
        {/* Action Tabs */}
        <div className="action-tabs">
          <button
            className={`tab-button ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => { setActiveTab('deposit'); setAmount(''); setError(null); }}
          >
            💰 Deposit
          </button>
          <button
            className={`tab-button ${activeTab === 'supply' ? 'active' : ''}`}
            onClick={() => { setActiveTab('supply'); setAmount(''); setError(null); }}
          >
            🏛️ Supply
          </button>
          <button
            className={`tab-button ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => { setActiveTab('withdraw'); setAmount(''); setError(null); }}
          >
            💸 Withdraw
          </button>
          <button
            className={`tab-button ${activeTab === 'rebalance' ? 'active' : ''}`}
            onClick={() => { setActiveTab('rebalance'); setAmount(''); setError(null); }}
          >
            🔄 Rebalance
          </button>
        </div>

        {/* Amount Input (not shown for rebalance) */}
        {activeTab !== 'rebalance' && (
          <div className="form-group">
            <label>
              Amount (vBTC)
              <span className="balance-label">
                {getBalanceLabel()}
              </span>
            </label>
            <div className="input-with-button">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.0001"
                min="0"
                className="input"
              />
              <button
                onClick={setMaxAmount}
                className="btn btn-sm btn-secondary max-button"
                type="button"
              >
                Max
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="action-button-container">
          {activeTab === 'deposit' && (
            <button
              onClick={handleDeposit}
              disabled={isProcessing || !amount}
              className="btn btn-primary btn-block"
            >
              {isProcessing ? 'Processing...' : 'Deposit to Vault'}
            </button>
          )}
          {activeTab === 'supply' && (
            <button
              onClick={handleSupplyToAave}
              disabled={isProcessing || !amount}
              className="btn btn-primary btn-block"
            >
              {isProcessing ? 'Processing...' : 'Supply to Aave'}
            </button>
          )}
          {activeTab === 'withdraw' && (
            <button
              onClick={handleWithdraw}
              disabled={isProcessing || !amount}
              className="btn btn-secondary btn-block"
            >
              {isProcessing ? 'Processing...' : 'Withdraw from Vault'}
            </button>
          )}
          {activeTab === 'rebalance' && (
            <button
              onClick={handleRebalance}
              disabled={isProcessing}
              className="btn btn-accent btn-block"
            >
              {isProcessing ? 'Processing...' : 'Rebalance Vault'}
            </button>
          )}
        </div>

        {error && <div className="error mt-2">{error}</div>}
        {success && <div className="success mt-2">{success}</div>}
      </div>
    </div>
  );
};
