import { useState, useEffect } from 'react';
import { getProvider, getStrategyFactoryContract, getLeverageStrategyContract } from '../utils/contracts';
import type { UserVault, VaultState } from '../types/contracts';

export const useVaults = (account: string | null) => {
  const [vaults, setVaults] = useState<UserVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaults = async () => {
    if (!account) {
      setVaults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const provider = getProvider();
      const factory = getStrategyFactoryContract(provider);

      const vaultAddresses = await factory.getVaultsByOwner(account);
      
      const vaultPromises = vaultAddresses.map(async (address: string) => {
        const strategy = getLeverageStrategyContract(address, provider);
        const state = await strategy.getVaultState();
        
        return {
          address,
          owner: account,
          state: {
            vaultBalance: state._vaultBalance,
            suppliedToAave: state._suppliedToAave,
            borrowedFromAave: state._borrowedFromAave,
            btcPosition: state._btcPosition,
            targetLeverageBps: state._targetLeverageBps,
            currentLeverageBps: state._currentLeverageBps,
            avgBtcPrice: state._avgBtcPrice,
            risk: Number(state._risk),
          } as VaultState,
        };
      });

      const fetchedVaults = await Promise.all(vaultPromises);
      setVaults(fetchedVaults);
      setError(null);
    } catch (err: any) {
      console.error('Vaults fetch error:', err);
      if (err.code === 'BAD_DATA') {
        setError('Contract not deployed. Please run: cd vault-contracts && npm run deploy:local');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Cannot connect to Hardhat node. Please run: cd vault-contracts && npx hardhat node');
      } else {
        setError(err.message || 'Failed to fetch vaults');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, [account]);

  return {
    vaults,
    loading,
    error,
    refresh: fetchVaults,
  };
};
