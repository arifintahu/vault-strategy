import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import type { WalletClient } from 'viem';
import type { Eip1193Provider } from 'ethers';

export function walletClientToProvider(walletClient: WalletClient) {
  const { chain, transport } = walletClient;
  
  if (!chain) {
    throw new Error('Chain not available');
  }
  
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport as Eip1193Provider, network);
  return provider;
}

export function useSigner() {
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!walletClient) return null;
    
    const provider = walletClientToProvider(walletClient);
    return provider.getSigner();
  }, [walletClient]);
}
