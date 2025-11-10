import { useAccount, useDisconnect } from 'wagmi';

export const useWallet = () => {
  const { address, isConnecting, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return {
    account: address || null,
    isConnecting,
    isConnected,
    disconnect,
  };
};
