'use client';

import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { getAllProducts } from '@/lib/store';
import { hasCompletedOnboarding } from '@/lib/onboarding';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from '@/components/wallet-connect';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import type { Review } from '@/lib/types';
import { Wallet } from 'lucide-react';

export default function BuyerHomePage() {
  const [products, setProducts] = useState<(Product & { reviews: Review[] })[]>([]);
  const router = useRouter();
  const { isConnected, wallet } = useWallet();

  useEffect(() => {
    // Check if user has completed onboarding
    if (!hasCompletedOnboarding()) {
      router.replace('/onboarding/step-1');
      return;
    }

    // Check if wallet is connected
    if (!isConnected || !wallet?.address) {
      return;
    }

    // Load products from store
    setProducts(getAllProducts());
    
    // Listen for storage changes (when new products are added)
    const handleStorageChange = () => {
      setProducts(getAllProducts());
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for changes (since same-tab updates don't trigger storage event)
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [router]);

  // Show wallet connection prompt if not connected
  if (!isConnected || !wallet?.address) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 perspective-1000 max-w-7xl">
          <Card className="max-w-2xl mx-auto mt-6 sm:mt-8 md:mt-12">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="mb-4 sm:mb-6">
                <Wallet className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary mx-auto mb-3 sm:mb-4 animate-pulse-3d" />
                <h2 className="text-2xl sm:text-3xl font-bold font-headline text-primary mb-2 px-4">Wallet Connection Required</h2>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-4">
                  Please connect your wallet to browse products and make purchases.
                </p>
              </div>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 perspective-1000 max-w-7xl">
        <div className="text-center mb-8 sm:mb-12 animate-slide-in-3d">
          <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-gradient-animated animate-float px-2">
            Discover & Bargain
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4">Find amazing deals and negotiate prices</p>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20 animate-slide-in-3d px-4">
            <div className="inline-block mb-4 sm:mb-6 animate-float">
              <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse-3d">
                <svg className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-muted-foreground text-lg sm:text-xl mb-2">No products available yet.</p>
            <p className="text-muted-foreground text-sm sm:text-base">Sellers can add products to start trading!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product, index) => (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className="group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
