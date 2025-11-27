'use client';

import { getAddress } from 'viem';

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'trust' | 'brave' | 'opera' | 'phantom' | 'rabby' | 'frame' | 'other';

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
 * Detect all available Web3 wallets (extensions and injected providers)
 */
export function detectWallets(): DetectedWallet[] {
  if (typeof window === 'undefined') return [];

  const wallets: DetectedWallet[] = [];
  const seenProviders = new Set();
  const ethereum = (window as any).ethereum;

  if (!ethereum) {
    return wallets;
  }

  // Check for multiple providers (some wallets inject multiple providers)
  const providers = ethereum.providers || [ethereum];

  providers.forEach((provider: any, index: number) => {
    // Skip if we've already seen this provider
    if (seenProviders.has(provider)) return;
    seenProviders.add(provider);

    // Check if provider has required methods
    if (!provider || !provider.request) return;

    let walletId: string | null = null;
    let walletName: string | null = null;
    let walletIcon: string | null = null;

    // MetaMask (browser extension)
    if (provider.isMetaMask && !provider.isBraveWallet) {
      walletId = 'metamask';
      walletName = 'MetaMask';
      walletIcon = '🦊';
    }
    // Coinbase Wallet (extension or mobile)
    else if (provider.isCoinbaseWallet) {
      walletId = 'coinbase';
      walletName = 'Coinbase Wallet';
      walletIcon = '🔷';
    }
    // Trust Wallet (browser extension)
    else if (provider.isTrust || provider.isTrustWallet) {
      walletId = 'trust';
      walletName = 'Trust Wallet';
      walletIcon = '🔒';
    }
    // Brave Wallet (browser extension)
    else if (provider.isBraveWallet) {
      walletId = 'brave';
      walletName = 'Brave Wallet';
      walletIcon = '🦁';
    }
    // Opera Wallet
    else if (provider.isOpera) {
      walletId = 'opera';
      walletName = 'Opera Wallet';
      walletIcon = '🎭';
    }
    // Phantom Wallet
    else if (provider.isPhantom) {
      walletId = 'phantom';
      walletName = 'Phantom';
      walletIcon = '👻';
    }
    // Rabby Wallet
    else if (provider.isRabby) {
      walletId = 'rabby';
      walletName = 'Rabby Wallet';
      walletIcon = '🐰';
    }
    // Frame Wallet
    else if (provider.isFrame) {
      walletId = 'frame';
      walletName = 'Frame';
      walletIcon = '🖼️';
    }
    // Generic EIP-1193 provider (catch-all for other wallets)
    else if (index === 0 || !wallets.find(w => w.id === 'other')) {
      // Try to identify by provider properties
      const providerString = JSON.stringify(provider);
      
      if (providerString.includes('MetaMask') || providerString.includes('metamask')) {
        walletId = 'metamask';
        walletName = 'MetaMask';
        walletIcon = '🦊';
      } else {
        walletId = 'other';
        walletName = 'Web3 Wallet';
        walletIcon = '💼';
      }
    }

    if (walletId && walletName && walletIcon) {
      // Check if we already added this wallet type
      const existing = wallets.find(w => w.id === walletId);
      if (!existing) {
        wallets.push({
          id: walletId,
          name: walletName,
          icon: walletIcon,
          provider,
          isInstalled: true,
        });
      }
    }
  });

  // Sort wallets: known wallets first, then generic
  const knownWallets = wallets.filter(w => w.id !== 'other');
  const otherWallets = wallets.filter(w => w.id === 'other');
  
  return [...knownWallets, ...otherWallets];
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
    // Log wallet connection attempt for tracking
    console.log('[Wallet] Attempting to connect to wallet provider', {
      hasRequest: !!provider.request,
      isMetaMask: provider.isMetaMask,
      isCoinbaseWallet: provider.isCoinbaseWallet,
      isTrust: provider.isTrust || provider.isTrustWallet,
      isBrave: provider.isBraveWallet,
    });

    // Request account access
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    });
    
    console.log('[Wallet] Accounts received:', accounts?.length || 0);

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

    // Determine wallet type with enhanced detection
    let walletType: WalletType = 'other';
    if (provider.isMetaMask && !provider.isBraveWallet) {
      walletType = 'metamask';
    } else if (provider.isCoinbaseWallet) {
      walletType = 'coinbase';
    } else if (provider.isTrust || provider.isTrustWallet) {
      walletType = 'trust';
    } else if (provider.isBraveWallet) {
      walletType = 'brave';
    } else if (provider.isOpera) {
      walletType = 'opera';
    } else if (provider.isPhantom) {
      walletType = 'phantom';
    } else if (provider.isRabby) {
      walletType = 'rabby';
    } else if (provider.isFrame) {
      walletType = 'frame';
    } else {
      // Try to identify by checking provider properties
      const providerString = JSON.stringify(provider);
      if (providerString.includes('MetaMask') || providerString.includes('metamask')) {
        walletType = 'metamask';
      } else if (providerString.includes('Coinbase') || providerString.includes('coinbase')) {
        walletType = 'coinbase';
      } else if (providerString.includes('Trust') || providerString.includes('trust')) {
        walletType = 'trust';
      }
    }

    const walletInfo = {
      address,
      chainId: chainIdNumber,
      walletType,
    };
    
    console.log('[Wallet] Successfully connected:', {
      address: formatWalletAddress(address),
      chainId: chainIdNumber,
      walletType,
    });
    
    return walletInfo;
  } catch (error: any) {
    console.error('[Wallet] Connection error:', error);
    
    // Provide more specific error messages
    if (error.code === 4001) {
      throw new Error('Connection rejected. Please approve the connection request in your wallet.');
    } else if (error.code === -32002) {
      throw new Error('Connection request already pending. Please check your wallet.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to connect to wallet. Please make sure your wallet is unlocked and try again.');
    }
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
  
  // Also store connection timestamp for tracking
  localStorage.setItem('wallet_connected_at', new Date().toISOString());
}

/**
 * Get all detected wallet providers (for debugging/tracking)
 */
export function getAllWalletProviders(): Array<{ name: string; isInstalled: boolean; properties: string[] }> {
  if (typeof window === 'undefined') return [];
  
  const providers: Array<{ name: string; isInstalled: boolean; properties: string[] }> = [];
  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    return providers;
  }
  
  const providerList = ethereum.providers || [ethereum];
  
  providerList.forEach((provider: any, index: number) => {
    if (!provider) return;
    
    const properties: string[] = [];
    if (provider.isMetaMask) properties.push('isMetaMask');
    if (provider.isCoinbaseWallet) properties.push('isCoinbaseWallet');
    if (provider.isTrust || provider.isTrustWallet) properties.push('isTrust');
    if (provider.isBraveWallet) properties.push('isBraveWallet');
    if (provider.isOpera) properties.push('isOpera');
    if (provider.isPhantom) properties.push('isPhantom');
    if (provider.isRabby) properties.push('isRabby');
    if (provider.isFrame) properties.push('isFrame');
    if (provider.request) properties.push('hasRequest');
    
    providers.push({
      name: `Provider ${index + 1}`,
      isInstalled: !!provider.request,
      properties,
    });
  });
  
  return providers;
}

/**
 * Check if a specific wallet type is available
 */
export function isWalletAvailable(walletType: WalletType): boolean {
  if (typeof window === 'undefined') return false;
  
  const wallets = detectWallets();
  return wallets.some(w => w.id === walletType);
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isTrust?: boolean;
      isTrustWallet?: boolean;
      isBraveWallet?: boolean;
      isOpera?: boolean;
      isPhantom?: boolean;
      isRabby?: boolean;
      isFrame?: boolean;
      providers?: any[];
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

