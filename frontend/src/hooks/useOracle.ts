import { useState, useEffect } from 'react';
import { getProvider, getOracleEMAContract } from '../utils/contracts';
import type { OracleData } from '../types/contracts';

export const useOracle = () => {
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOracleData = async () => {
    try {
      setLoading(true);
      const provider = getProvider();
      const oracle = getOracleEMAContract(provider);

      const [price, ema20, ema50, ema200] = await oracle.get();
      const signal = await oracle.getSignal();
      const isBullish = await oracle.isBullish();
      const isBearish = await oracle.isBearish();

      // Check if oracle is initialized (price > 0)
      if (price === 0n) {
        setError('Oracle not initialized. Please run: cd vault-contracts && npx hardhat run scripts/init-oracle.ts --network localhost');
        setLoading(false);
        return;
      }

      setOracleData({
        price,
        ema20,
        ema50,
        ema200,
        signal: Number(signal),
        isBullish,
        isBearish,
      });
      setError(null);
    } catch (err: any) {
      console.error('Oracle fetch error:', err);
      if (err.code === 'BAD_DATA') {
        setError('Oracle not initialized. Run: npx hardhat run scripts/init-oracle.ts --network localhost');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Cannot connect to Hardhat node. Run: npx hardhat node');
      } else {
        setError(err.message || 'Failed to fetch oracle data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOracleData();
    // Refresh every 10 seconds
    const interval = setInterval(fetchOracleData, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    oracleData,
    loading,
    error,
    refresh: fetchOracleData,
  };
};
