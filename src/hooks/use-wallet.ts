'use client';

import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import {
  connectMetamask,
  connectCoinbase,
  connectGenericWallet,
  disconnectWallet,
  getStoredWallet,
  storeWallet,
  type WalletInfo,
} from '@/lib/wallet';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setWallet(null);
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    // Try to restore wallet connection on mount
    try {
      const stored = getStoredWallet();
      if (stored) {
        setWallet(stored);
      }
    } catch (error) {
      console.error('Error restoring wallet:', error);
    }

    // Listen for account changes from any provider
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        const handleAccountsChanged = (accounts: string[]) => {
          try {
            if (accounts.length === 0) {
              setWallet(null);
              disconnectWallet().catch(console.error);
            } else {
              setWallet((currentWallet) => {
                if (currentWallet) {
                  const newWallet = { ...currentWallet, address: accounts[0] };
                  storeWallet(newWallet);
                  return newWallet;
                }
                return currentWallet;
              });
            }
          } catch (error) {
            console.error('Error handling account change:', error);
          }
        };

        const handleChainChanged = () => {
          // Reload page on chain change
          try {
            window.location.reload();
          } catch (error) {
            console.error('Error reloading on chain change:', error);
          }
        };

        // Handle multiple providers (some wallets inject multiple providers)
        const providers = ethereum.providers || [ethereum];
        const listeners: Array<{ provider: any; remove: () => void }> = [];

        providers.forEach((provider: any) => {
          try {
            if (provider.on) {
              provider.on('accountsChanged', handleAccountsChanged);
              provider.on('chainChanged', handleChainChanged);
              
              listeners.push({
                provider,
                remove: () => {
                  try {
                    provider.removeListener?.('accountsChanged', handleAccountsChanged);
                    provider.removeListener?.('chainChanged', handleChainChanged);
                  } catch (error) {
                    console.error('Error removing listener:', error);
                  }
                },
              });
            }
          } catch (error) {
            console.error('Error setting up wallet listener:', error);
          }
        });

        return () => {
          listeners.forEach(({ remove }) => remove());
        };
      }
    }
  }, []);

  const connect = async (walletType: string = 'metamask', provider?: any) => {
    setIsConnecting(true);
    try {
      let walletInfo: WalletInfo | null = null;

      // If provider is provided, use generic connection
      if (provider) {
        walletInfo = await connectGenericWallet(provider);
      } else if (walletType === 'metamask') {
        walletInfo = await connectMetamask();
      } else if (walletType === 'coinbase') {
        walletInfo = await connectCoinbase();
      } else {
        // Try generic connection for other wallet types
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const ethereum = (window as any).ethereum;
          const providers = ethereum.providers || [ethereum];
          const targetProvider = providers.find((p: any) => {
            if (walletType === 'trust') return p.isTrust;
            if (walletType === 'brave') return p.isBraveWallet;
            return p === ethereum;
          }) || ethereum;
          walletInfo = await connectGenericWallet(targetProvider);
        } else {
          throw new Error('No Web3 wallet detected');
        }
      }

      if (walletInfo) {
        setWallet(walletInfo);
        storeWallet(walletInfo);
        toast({
          title: 'Wallet Connected',
          description: `Successfully connected to ${walletInfo.walletType}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    wallet,
    isConnected: !!wallet,
    isConnecting,
    connect,
    disconnect: handleDisconnect,
  };
}

