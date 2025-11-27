'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductsBySeller, getOffersBySeller, deleteProduct, getSoldProductsBySeller, getProductSalesCount, getNewOffersCount, getSellerOverallRating, getSellerLoyaltyPoints, getSellerLoyaltyTier, getAllReviewsBySeller } from '@/lib/store';
import { hasCompletedOnboarding } from '@/lib/onboarding';
import { useWallet } from '@/hooks/use-wallet';
import { PlusCircle, List, Tag, Edit, Trash2, Bell, ShoppingBag, TrendingUp, Star, Award, MessageSquare, Store, Sparkles, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import type { Product } from '@/lib/types';
import type { Review } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function SellerDashboard() {
  const { wallet } = useWallet();
  const router = useRouter();
  const { toast } = useToast();
  const [sellerProducts, setSellerProducts] = useState<(Product & { reviews: Review[] })[]>([]);
  const [pendingOffersCount, setPendingOffersCount] = useState(0);
  const [soldProducts, setSoldProducts] = useState<Array<{ productId: string; productName: string; salesCount: number; lastSaleDate: string }>>([]);
  const lastCheckedRef = useRef<string>(new Date().toISOString());
  const [newOffersCount, setNewOffersCount] = useState(0);
  const [sellerRating, setSellerRating] = useState({ rating: 0, totalReviews: 0 });
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState({ tier: 'Unrated', color: 'text-muted-foreground', icon: '📊' });
  const [allReviews, setAllReviews] = useState<any[]>([]);

  useEffect(() => {
    // Check if user has completed onboarding
    if (!hasCompletedOnboarding()) {
      router.replace('/onboarding/step-1');
      return;
    }

    if (wallet?.address) {
      loadProducts();
      loadOffers();
      loadSoldProducts();
      loadSellerStats();
      checkNewOffers();
      // Refresh periodically
      const interval = setInterval(() => {
        loadProducts();
        loadOffers();
        loadSoldProducts();
        loadSellerStats();
        checkNewOffers();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [wallet?.address, router]);

  const loadProducts = () => {
    if (wallet?.address) {
      const products = getProductsBySeller(wallet.address);
      setSellerProducts(products);
    }
  };

  const loadOffers = () => {
    if (wallet?.address) {
      const offers = getOffersBySeller(wallet.address);
      setPendingOffersCount(offers.filter(o => o.status === 'pending' || o.status === 'counter-offered').length);
    }
  };

  const loadSoldProducts = () => {
    if (wallet?.address) {
      const sold = getSoldProductsBySeller(wallet.address);
      setSoldProducts(sold);
    }
  };

  const loadSellerStats = () => {
    if (wallet?.address) {
      const rating = getSellerOverallRating(wallet.address);
      const points = getSellerLoyaltyPoints(wallet.address);
      const tier = getSellerLoyaltyTier(points);
      const reviews = getAllReviewsBySeller(wallet.address);
      
      setSellerRating(rating);
      setLoyaltyPoints(points);
      setLoyaltyTier(tier);
      setAllReviews(reviews);
    }
  };

  const checkNewOffers = () => {
    if (wallet?.address) {
      const newCount = getNewOffersCount(wallet.address, lastCheckedRef.current);
      if (newCount > newOffersCount && newOffersCount > 0) {
        // Show notification for new offers
        toast({
          title: 'New Offer Received!',
          description: `You have ${newCount} new offer(s) or counter-offer(s).`,
        });
      }
      setNewOffersCount(newCount);
      lastCheckedRef.current = new Date().toISOString();
    }
  };

  if (!wallet?.address) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
              <p className="text-muted-foreground">Please connect your wallet to access the seller dashboard.</p>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4 animate-slide-in-3d">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-gradient-animated mb-2">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Manage your products and view your sales.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {sellerRating.rating > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <div>
                  <div className="text-lg font-bold text-yellow-400">{sellerRating.rating.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">{sellerRating.totalReviews} reviews</div>
                </div>
              </div>
            )}
            {loyaltyPoints > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <Award className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-lg font-bold text-purple-400">{loyaltyPoints} pts</div>
                  <div className="text-xs text-muted-foreground">{loyaltyTier.tier}</div>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              asChild
              className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50"
            >
              <Link href="/seller/offers">
                <Bell className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                Offers
                {pendingOffersCount > 0 && (
                  <Badge variant="destructive" className="ml-2 animate-pulse-3d">
                    {pendingOffersCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                asChild
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/30"
              >
                <Link href="/seller/add-product?type=premium">
                  <Sparkles className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  Add Premium Product
                </Link>
              </Button>
              <Button 
                asChild
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
              >
                <Link href="/seller/add-product?type=other">
                  <Package className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  Add Other Product
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Seller Guide Section */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm animate-slide-in-3d">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 animate-pulse-3d">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  How to Sell on Barcel
                </CardTitle>
                <CardDescription>
                  Follow these steps to start selling your products
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Add Your Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Add New Product" to list your items. Upload images, set your product name and description, and create price tiers for negotiation.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Receive Offers</h3>
                  <p className="text-sm text-muted-foreground">
                    Buyers will browse your products and make offers. You'll receive notifications when new offers come in. Check the "Offers" section to view and manage all offers.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Negotiate Prices</h3>
                  <p className="text-sm text-muted-foreground">
                    Review offers and counter-offer if needed. You can accept, reject, or propose a different price. The negotiation history is saved for transparency.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Complete Sales</h3>
                  <p className="text-sm text-muted-foreground">
                    Once a buyer confirms payment, complete the purchase to receive funds. Track your sales and build your reputation with buyer reviews.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Build Your Reputation</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn positive reviews from buyers to increase your seller rating and loyalty points. Higher ratings help you attract more customers and unlock premium features.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller Stats Section */}
        {(sellerRating.rating > 0 || allReviews.length > 0) && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm animate-slide-in-3d">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 animate-pulse-3d">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Your Ratings & Reviews
                  </CardTitle>
                  <CardDescription>
                    See what buyers are saying about your products
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{sellerRating.rating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Overall Rating</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{sellerRating.totalReviews}</div>
                  <div className="text-sm text-muted-foreground">Total Reviews</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                  <div className="text-4xl font-bold text-purple-400 mb-2">{loyaltyPoints}</div>
                  <div className="text-sm text-muted-foreground">Loyalty Points ({loyaltyTier.tier})</div>
                </div>
              </div>

              {allReviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    Recent Reviews
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allReviews.slice(0, 5).map((review) => (
                      <Card key={review.id} className="border-primary/10 bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{review.productName}</p>
                              <p className="text-xs text-muted-foreground">{review.author} • {new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sold Products Section */}
        {soldProducts.length > 0 && (
          <Card className="mb-8 border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 backdrop-blur-sm animate-slide-in-3d">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20 animate-pulse-3d">
                  <ShoppingBag className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    Sold Products
                  </CardTitle>
                  <CardDescription>
                    Products that have been successfully sold
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {soldProducts.map((sold, index) => {
                  const product = sellerProducts.find(p => p.id === sold.productId);
                  return (
                    <Card 
                      key={sold.productId} 
                      className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 transition-all duration-500 card-3d"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base mb-2 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                              {sold.productName}
                            </h4>
                            {product && (
                              <div className="relative overflow-hidden rounded-lg">
                                <Image
                                  src={product.images[0]}
                                  alt={sold.productName}
                                  width={100}
                                  height={75}
                                  className="rounded-md object-cover transition-transform duration-500 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-green-500/20">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-green-500/20 animate-pulse">
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            </div>
                            <span className="text-sm font-bold text-green-400">
                              {sold.salesCount} {sold.salesCount === 1 ? 'sale' : 'sales'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sold.lastSaleDate).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-primary/10 animate-slide-in-3d">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Products
            </CardTitle>
            <CardDescription className="text-base">
              {sellerProducts.length > 0
                ? `You have ${sellerProducts.length} product(s) listed.`
                : "You haven't listed any products yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sellerProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {sellerProducts.map((product, index) => (
                  <Card 
                    key={product.id} 
                    className="flex flex-col md:flex-row items-start gap-4 p-5 border-primary/20 bg-gradient-to-br from-card/50 to-card/30 hover:from-card/80 hover:to-card/50 transition-all duration-500 card-3d"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative overflow-hidden rounded-lg group/image">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={150}
                        height={100}
                        className="rounded-md object-cover aspect-[3/2] transition-all duration-500 group-hover/image:scale-110 group-hover/image:rotate-1"
                        data-ai-hint="product image"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl font-headline mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {product.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10">
                          <List className="h-4 w-4 text-primary" />
                          <span>{product.reviews.length} reviews</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10">
                          <Tag className="h-4 w-4 text-accent" />
                          <span>{product.priceOptions.length} price tiers</span>
                        </div>
                        {getProductSalesCount(product.id) > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 animate-pulse-3d">
                            <ShoppingBag className="h-4 w-4 text-green-400" />
                            <span className="text-green-400 font-medium">
                              {getProductSalesCount(product.id)} {getProductSalesCount(product.id) === 1 ? 'sale' : 'sales'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 self-start md:self-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                        >
                          <Link href={`/seller/edit-product/${product.id}`}>
                            <Edit className="mr-2 h-3 w-3 transition-transform duration-300 group-hover:rotate-12" /> Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-destructive/20"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                              const deleted = deleteProduct(product.id);
                              if (deleted) {
                                toast({
                                  title: 'Product Deleted',
                                  description: `${product.name} has been removed.`,
                                });
                                loadProducts();
                              } else {
                                toast({
                                  title: 'Error',
                                  description: 'Failed to delete product. Please try again.',
                                  variant: 'destructive',
                                });
                              }
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-3 w-3 transition-transform duration-300 group-hover:rotate-12" /> Delete
                        </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Ready to sell? Add your first product to get started.</p>
                    <Button asChild>
                      <Link href="/seller/add-product">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        List a Product
                      </Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
