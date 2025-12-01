'use client';

import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { getAllProducts } from '@/lib/store';
import { hasCompletedOnboarding } from '@/lib/onboarding';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from '@/components/wallet-connect';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import type { Review } from '@/lib/types';
import { Wallet, ShoppingCart, Bot } from 'lucide-react';
import { useAssistant } from '@/modules/ai-assistant/context';

export default function BuyerHomePage() {
  const [products, setProducts] = useState<(Product & { reviews: Review[] })[]>([]);
  const router = useRouter();
  const { isConnected, wallet } = useWallet();
  const { openAssistant } = useAssistant();

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

    // Load products function
    const loadProducts = () => {
      setProducts(getAllProducts());
    };
    
    // Initial load
    loadProducts();
    
    // Listen for custom event (same tab updates)
    const handleProductsUpdated = () => {
      loadProducts();
    };
    
    // Listen for storage changes (when new products are added in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      // Only reload if products storage changed
      if (e.key === 'celobargain_products') {
        loadProducts();
      }
    };
    
    window.addEventListener('productsUpdated', handleProductsUpdated);
    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for changes (backup mechanism)
    const interval = setInterval(loadProducts, 2000);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [router, isConnected, wallet?.address]);

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

        {/* Buyer Guide Section */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm animate-slide-in-3d">
          <CardHeader>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-primary/20 animate-pulse-3d flex-shrink-0">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-lg sm:text-xl break-words">
                  How to Buy on Barcel
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words">
                  Follow these steps to start shopping and making purchases
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm sm:text-base">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 text-sm sm:text-base break-words">Browse Products</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    Explore the marketplace to find products you're interested in. Click on any product to view detailed information, images, and seller profile.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm sm:text-base">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 text-sm sm:text-base break-words">Make an Offer</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    Select a price tier or enter your own offer price. Sellers can see your offer and may accept, reject, or counter-offer with a different price.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm sm:text-base">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 text-sm sm:text-base break-words">Negotiate</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    Engage in price negotiations with sellers. You can make counter-offers until both parties agree on a price. All negotiation history is transparent.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm sm:text-base">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 text-sm sm:text-base break-words">Confirm Payment</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    Once you agree on a price, confirm the payment. Your funds will be securely held in escrow until the seller completes the transaction.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm sm:text-base">
                  5
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 text-sm sm:text-base break-words">Leave a Review</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    After receiving your product, leave a review to help other buyers and help sellers build their reputation. Your feedback matters!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant CTA */}
        <Card className="mb-8 border-accent/30 bg-background/80 backdrop-blur animate-slide-in-3d">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Need Help?</CardTitle>
                <CardDescription>Chat with the Barcel AI assistant for navigation tips, product suggestions, or bargaining help.</CardDescription>
              </div>
            </div>
            <Button onClick={openAssistant} className="mt-4 sm:mt-0 whitespace-nowrap">
              Launch AI Assistant
            </Button>
          </CardHeader>
        </Card>
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
