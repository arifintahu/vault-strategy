import { useState, useEffect } from 'react';
import { getVaultBTCContract } from '../../utils/contracts';
import { formatBTC } from '../../utils/formatting';
import { useWallet } from '../../hooks/useWallet';
import { useSigner } from '../../hooks/useSigner';

interface FaucetModalProps {
  onClose: () => void;
}

export const FaucetModal = ({ onClose }: FaucetModalProps) => {
  const { account } = useWallet();
  const signer = useSigner();
  const [canRequest, setCanRequest] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState<bigint>(0n);

  // Check faucet status
  useEffect(() => {
    const checkFaucetStatus = async () => {
      if (!account) return;

      try {
        const signerInstance = await signer;
        if (!signerInstance) return;

        const vbtc = getVaultBTCContract(signerInstance);
        const [can, timeLeft] = await vbtc.canRequestFaucet(account);
        const bal = await vbtc.balanceOf(account);

        console.log('Faucet status:', { canRequest: can, timeLeft: timeLeft.toString(), balance: bal.toString() });

        setCanRequest(can);
        setTimeUntilNext(Number(timeLeft));
        setBalance(bal);
      } catch (err) {
        console.error('Error checking faucet status:', err);
        // If the function doesn't exist, assume it's an old contract
        setCanRequest(false);
        setError('Faucet not available. Please redeploy the contract.');
      }
    };

    checkFaucetStatus();
    const interval = setInterval(checkFaucetStatus, 5000);
    return () => clearInterval(interval);
  }, [account, signer]);

  const handleRequestFaucet = async () => {
    if (!signer) return;

    setIsRequesting(true);
    setError(null);
    setSuccess(false);

    try {
      const signerInstance = await signer;
      const vbtc = getVaultBTCContract(signerInstance);

      const tx = await vbtc.requestFaucet();
      await tx.wait();

      setSuccess(true);

      // Refresh status
      const [can, timeLeft] = await vbtc.canRequestFaucet(account!);
      const bal = await vbtc.balanceOf(account!);
      setCanRequest(can);
      setTimeUntilNext(Number(timeLeft));
      setBalance(bal);
    } catch (err: any) {
      if (err.message.includes('FAUCET_COOLDOWN')) {
        setError('Please wait 24 hours between faucet requests');
      } else {
        setError(err.message);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds === 0) return 'Available now';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s remaining`;
    } else {
      return `${secs}s remaining`;
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💧 vBTC Faucet</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        
        <div className="modal-body">
          {!account ? (
            <div className="faucet-message">
              <p>Connect your wallet to request test vBTC</p>
            </div>
          ) : (
            <>
              <div className="faucet-info">
                <div className="faucet-stat">
                  <label>Your Balance</label>
                  <div className="value">{formatBTC(balance)} vBTC</div>
                </div>
                <div className="faucet-stat">
                  <label>Faucet Amount</label>
                  <div className="value">10 vBTC</div>
                </div>
                <div className="faucet-stat">
                  <label>Status</label>
                  <div className={`value ${canRequest ? 'available' : 'cooldown'}`}>
                    {formatTimeRemaining(timeUntilNext)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleRequestFaucet}
                disabled={isRequesting || !canRequest}
                className="btn btn-primary btn-block"
              >
                {isRequesting ? '⏳ Requesting...' : canRequest ? '💧 Request 10 vBTC' : '⏰ Cooldown Active'}
              </button>

              {error && <div className="error mt-2">{error}</div>}
              {success && <div className="success mt-2">✅ Successfully received 10 vBTC!</div>}

              <div className="faucet-note">
                <small>
                  ℹ️ You can request 10 vBTC every 24 hours. This is for testing purposes only.
                </small>
                {!canRequest && timeUntilNext === 0 && (
                  <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--warning)' }}>
                    ⚠️ If you haven't requested before and see cooldown, please redeploy contracts.
                  </small>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
