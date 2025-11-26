'use client';

import { getAddress } from 'viem';

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'trust' | 'brave' | 'other';

export interface WalletInfo {
  address: string;
  chainId: number;
  walletType: WalletType;
}

export interface DetectedWallet {
  id: string;
  name: string;
  icon: string;
  provider: any;
  isInstalled: boolean;
}

// Celo network configuration
export const CELO_CHAIN_ID = 42220; // Mainnet
export const CELO_TESTNET_CHAIN_ID = 44787; // Alfajores

export function formatWalletAddress(address: string): string {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Detect all available Web3 wallets
 */
export function detectWallets(): DetectedWallet[] {
  if (typeof window === 'undefined') return [];

  const wallets: DetectedWallet[] = [];
  const ethereum = (window as any).ethereum;

  if (!ethereum) {
    return wallets;
  }

  // Check for multiple providers (some wallets inject multiple providers)
  const providers = ethereum.providers || [ethereum];

  providers.forEach((provider: any, index: number) => {
    // MetaMask
    if (provider.isMetaMask && !provider.isBraveWallet) {
      wallets.push({
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        provider,
        isInstalled: true,
      });
    }
    // Coinbase Wallet
    else if (provider.isCoinbaseWallet) {
      wallets.push({
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🔷',
        provider,
        isInstalled: true,
      });
    }
    // Trust Wallet
    else if (provider.isTrust) {
      wallets.push({
        id: 'trust',
        name: 'Trust Wallet',
        icon: '🔒',
        provider,
        isInstalled: true,
      });
    }
    // Brave Wallet
    else if (provider.isBraveWallet) {
      wallets.push({
        id: 'brave',
        name: 'Brave Wallet',
        icon: '🦁',
        provider,
        isInstalled: true,
      });
    }
    // Generic EIP-1193 provider (catch-all for other wallets)
    else if (provider.request && index === 0) {
      // Only add generic provider once
      const existingGeneric = wallets.find(w => w.id === 'other');
      if (!existingGeneric) {
        wallets.push({
          id: 'other',
          name: 'Web3 Wallet',
          icon: '💼',
          provider,
          isInstalled: true,
        });
      }
    }
  });

  return wallets;
}

/**
 * Connect to any EIP-1193 compatible wallet
 */
export async function connectGenericWallet(provider: any): Promise<WalletInfo | null> {
  if (typeof window === 'undefined') return null;

  if (!provider || !provider.request) {
    throw new Error('Invalid wallet provider');
  }

  try {
    // Request account access
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    let address: string;
    try {
      address = getAddress(accounts[0]);
    } catch (error) {
      // Fallback if getAddress fails
      address = accounts[0];
    }

    const chainId = await provider.request({ method: 'eth_chainId' });
    const chainIdNumber = typeof chainId === 'string' 
      ? parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
      : Number(chainId);

    // Check if we need to switch to Celo network
    if (chainIdNumber !== CELO_CHAIN_ID && chainIdNumber !== CELO_TESTNET_CHAIN_ID) {
      try {
        // Try to switch to Celo Alfajores (testnet)
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CELO_TESTNET_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        // If the chain doesn't exist, add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CELO_TESTNET_CHAIN_ID.toString(16)}`,
                chainName: 'Celo Alfajores',
                nativeCurrency: {
                  name: 'CELO',
                  symbol: 'CELO',
                  decimals: 18,
                },
                rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
                blockExplorerUrls: ['https://alfajores.celoscan.io'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    // Determine wallet type
    let walletType: WalletType = 'other';
    if (provider.isMetaMask && !provider.isBraveWallet) {
      walletType = 'metamask';
    } else if (provider.isCoinbaseWallet) {
      walletType = 'coinbase';
    } else if (provider.isTrust) {
      walletType = 'trust';
    } else if (provider.isBraveWallet) {
      walletType = 'brave';
    }

    return {
      address,
      chainId: chainIdNumber,
      walletType,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to connect to wallet');
  }
}

export async function connectMetamask(): Promise<WalletInfo | null> {
  if (typeof window === 'undefined') return null;

  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    throw new Error('No Web3 wallet detected. Please install a Web3 wallet to continue.');
  }

  // Find MetaMask provider (could be in providers array or direct)
  const providers = ethereum.providers || [ethereum];
  const metamaskProvider = providers.find((p: any) => p.isMetaMask && !p.isBraveWallet) || 
                          (ethereum.isMetaMask && !ethereum.isBraveWallet ? ethereum : null);

  if (!metamaskProvider) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  return connectGenericWallet(metamaskProvider);
}

export async function connectWalletConnect(): Promise<WalletInfo | null> {
  // WalletConnect integration would go here
  // For now, we'll use a placeholder
  throw new Error('WalletConnect integration coming soon');
}

export async function connectCoinbase(): Promise<WalletInfo | null> {
  if (typeof window === 'undefined') return null;

  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    throw new Error('No Web3 wallet detected. Please install a Web3 wallet to continue.');
  }

  // Find Coinbase Wallet provider
  const providers = ethereum.providers || [ethereum];
  const coinbaseProvider = providers.find((p: any) => p.isCoinbaseWallet) || 
                          (ethereum.isCoinbaseWallet ? ethereum : null);

  if (!coinbaseProvider) {
    throw new Error('Coinbase Wallet is not installed.');
  }

  return connectGenericWallet(coinbaseProvider);
}

export async function disconnectWallet(): Promise<void> {
  // Clear any stored wallet info
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_type');
  }
}

export function getStoredWallet(): WalletInfo | null {
  if (typeof window === 'undefined') return null;

  const address = localStorage.getItem('wallet_address');
  const walletType = localStorage.getItem('wallet_type') as WalletType | null;

  if (!address || !walletType) return null;

  return {
    address,
    chainId: CELO_TESTNET_CHAIN_ID,
    walletType,
  };
}

export function storeWallet(wallet: WalletInfo): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wallet_address', wallet.address);
  localStorage.setItem('wallet_type', wallet.walletType);
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isTrust?: boolean;
      isBraveWallet?: boolean;
      providers?: any[];
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

