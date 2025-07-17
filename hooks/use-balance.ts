'use client';

import { config } from '@/lib/config';
import { useAccount, useBalance } from 'wagmi';

export function useWalletBalance() {
  const { address, isConnected } = useAccount();

  const {
    data: balance,
    isLoading,
    error,
  } = useBalance({
    address,
    chainId: config.chainId,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 60 * 1000,
    },
  });

  return {
    balance,
    isLoading,
    error,
    isConnected,
    address,
  };
}
