'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Store, ArrowRight, ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from '@/components/wallet-connect';
import { completeOnboarding, setUserRole } from '@/lib/onboarding';

export default function RoleSelectionPage() {
  const { isConnected, wallet } = useWallet();

  const handleRoleSelection = (role: 'buyer' | 'seller', e: React.MouseEvent) => {
    // Require wallet connection before proceeding
    if (!isConnected || !wallet?.address) {
      e.preventDefault();
      return;
    }
    
    // Mark onboarding as completed and store the selected role
    completeOnboarding();
    setUserRole(role);
  };

  return (
    <div className="flex flex-col items-center text-center p-4 sm:p-6 md:p-8 max-w-4xl mx-auto min-h-[60vh] justify-center">
      <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-primary mb-3 sm:mb-4 px-4">
          Choose Your Role
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Are you looking to buy or sell? Connect your wallet and select your role to get started on Barcel.
        </p>
        
        {!isConnected && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg border-2 border-primary/30 bg-primary/10 backdrop-blur-sm mx-4">
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-accent animate-pulse-3d" />
              <div className="text-center">
                <p className="text-sm sm:text-base font-semibold mb-2">Wallet Connection Required</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Please connect your wallet to continue</p>
              </div>
              <WalletConnect />
            </div>
          </div>
        )}

        {isConnected && wallet?.address && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 backdrop-blur-sm mx-4">
            <p className="text-sm text-green-400 flex items-center justify-center gap-2 font-semibold">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              Wallet Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </p>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full max-w-3xl mb-8 sm:mb-12 perspective-1000 px-4">
        <Link 
          href={isConnected && wallet?.address ? "/" : "#"} 
          className={`group ${!isConnected || !wallet?.address ? 'pointer-events-none opacity-50' : ''}`}
          onClick={(e) => handleRoleSelection('buyer', e)}
        >
          <Card className={`h-full border-primary/20 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm transform transition-all duration-500 ${isConnected && wallet?.address ? 'group-hover:scale-105 group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/30' : ''} card-3d animate-slide-in-3d`}>
            <CardHeader className="p-6">
              <div className="flex justify-center mb-5">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-500 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 animate-pulse-3d">
                  <ShoppingCart className="h-12 w-12 text-primary transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                </div>
              </div>
              <CardTitle className="text-3xl text-center mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                I'm a Buyer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <CardDescription className="text-center mb-5 text-base leading-relaxed">
                Browse products, make offers, and find great deals. Negotiate prices directly with sellers.
              </CardDescription>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary group-hover:text-primary transition-colors">
                <span>Start Shopping</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link 
          href={isConnected && wallet?.address ? "/seller" : "#"} 
          className={`group ${!isConnected || !wallet?.address ? 'pointer-events-none opacity-50' : ''}`}
          onClick={(e) => handleRoleSelection('seller', e)}
        >
          <Card className={`h-full border-accent/20 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm transform transition-all duration-500 ${isConnected && wallet?.address ? 'group-hover:scale-105 group-hover:border-accent/50 group-hover:shadow-2xl group-hover:shadow-accent/30' : ''} card-3d animate-slide-in-3d`} style={{ animationDelay: '0.1s' }}>
            <CardHeader className="p-6">
              <div className="flex justify-center mb-5">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-500 shadow-lg shadow-accent/20 group-hover:shadow-xl group-hover:shadow-accent/30 animate-pulse-3d">
                  <Store className="h-12 w-12 text-accent transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                </div>
              </div>
              <CardTitle className="text-3xl text-center mb-3 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                I'm a Seller
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <CardDescription className="text-center mb-5 text-base leading-relaxed">
                List your products, receive offers, and make sales. Set your prices and negotiate with buyers.
              </CardDescription>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-accent group-hover:text-accent transition-colors">
                <span>Start Selling</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex w-full justify-between items-center mt-auto pt-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/onboarding/step-2"><ArrowLeft /></Link>
        </Button>
        <div className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
          <span className="h-2 w-2 rounded-full bg-primary"></span>
        </div>
        <div className="w-10"></div>
      </div>
    </div>
  );
}
