'use client';

import { Button } from './ui/button';
import { Wallet, LogOut, ChevronDown, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useWallet } from '@/hooks/use-wallet';
import { formatWalletAddress, detectWallets, type DetectedWallet } from '@/lib/wallet';
import { useState, useEffect } from 'react';

export function WalletConnect() {
  const { wallet, isConnected, isConnecting, connect, disconnect } = useWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);

  useEffect(() => {
    // Detect wallets when dialog opens
    if (isDialogOpen) {
      const wallets = detectWallets();
      setDetectedWallets(wallets);
    }
  }, [isDialogOpen]);

  const handleConnect = async (wallet: DetectedWallet) => {
    try {
      await connect(wallet.id, wallet.provider);
      setIsDialogOpen(false);
    } catch (error) {
      // Error is already handled by the useWallet hook
      console.error('Wallet connection error:', error);
    }
  };

  if (isConnected && wallet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                {wallet.address && wallet.address.length > 2 
                  ? wallet.address.slice(2, 4).toUpperCase() 
                  : 'W'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">
              {wallet.address ? formatWalletAddress(wallet.address) : 'Connected'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Connected Wallet</p>
              <p className="text-xs text-muted-foreground font-mono">
                {wallet.address ? formatWalletAddress(wallet.address) : 'Unknown'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => {
              try {
                disconnect();
              } catch (error) {
                console.error('Disconnect error:', error);
              }
            }} 
            className="text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={isConnecting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Barcel. We support all Web3 wallets compatible with EIP-1193.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto">
          {detectedWallets.length > 0 ? (
            <>
              {detectedWallets.map((detectedWallet) => (
                <Button
                  key={detectedWallet.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                  onClick={() => handleConnect(detectedWallet)}
                  disabled={isConnecting}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl shrink-0">
                      {detectedWallet.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-base">{detectedWallet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {detectedWallet.isInstalled ? 'Click to connect' : 'Not installed'}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-semibold mb-2">No Web3 Wallet Detected</p>
              <p className="text-xs text-muted-foreground mb-4">
                Please install a Web3 wallet to continue. Popular options include:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Download className="h-3 w-3" />
                  MetaMask
                </a>
                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Download className="h-3 w-3" />
                  Coinbase Wallet
                </a>
                <a
                  href="https://trustwallet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Download className="h-3 w-3" />
                  Trust Wallet
                </a>
              </div>
            </div>
          )}
          <p className="text-xs text-center text-muted-foreground mt-4 pt-4 border-t">
            By connecting, you agree to Barcel's Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
