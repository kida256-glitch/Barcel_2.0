'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getOffersBySeller, updateOfferStatus, getProductById, createCounterOffer } from '@/lib/store';
import { useWallet } from '@/hooks/use-wallet';
import { useEffect, useState } from 'react';
import type { Offer } from '@/lib/store';
import { Check, X, ShoppingCart, Clock, AlertCircle, ArrowLeftRight, DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatWalletAddress } from '@/lib/wallet';
import Link from 'next/link';

export default function SellerOffersPage() {
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [previousOffersCount, setPreviousOffersCount] = useState(0);
  const [previousCounterOffers, setPreviousCounterOffers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (wallet?.address) {
      loadOffers();
      // Refresh offers periodically
      const interval = setInterval(loadOffers, 2000);
      return () => clearInterval(interval);
    }
  }, [wallet?.address]);

  const loadOffers = () => {
    if (wallet?.address) {
      const sellerOffers = getOffersBySeller(wallet.address);
      const activeOffers = sellerOffers.filter(o => o.status === 'pending' || o.status === 'counter-offered');
      
      // Check for new offers
      if (activeOffers.length > previousOffersCount && previousOffersCount > 0) {
        const newCount = activeOffers.length - previousOffersCount;
        toast({
          title: 'New Offer Received!',
          description: `You have ${newCount} new offer(s) from buyers.`,
        });
      }
      
      // Check for new counter-offers from buyers
      const currentCounterOffers = new Set(
        sellerOffers
          .filter(o => o.currentCounterOffer?.from === 'buyer')
          .map(o => `${o.id}-${o.currentCounterOffer?.timestamp}`)
      );
      
      const newCounterOffers = Array.from(currentCounterOffers).filter(
        id => !previousCounterOffers.has(id)
      );
      
      if (newCounterOffers.length > 0 && previousCounterOffers.size > 0) {
        toast({
          title: 'New Counter-Offer!',
          description: `Buyer has sent you ${newCounterOffers.length} new counter-offer(s).`,
        });
      }
      
      setPreviousOffersCount(activeOffers.length);
      setPreviousCounterOffers(currentCounterOffers);
      setOffers(sellerOffers);
    }
  };

  const handleApproveOffer = (offerId: string) => {
    const offer = updateOfferStatus(offerId, 'approved');
    if (offer) {
      toast({
        title: 'Offer Approved!',
        description: `The buyer has been notified. They can now complete the purchase.`,
      });
      loadOffers();
    }
  };

  const handleCompletePurchase = async (offerId: string, productId: string) => {
    if (!wallet?.address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to complete the purchase.',
        variant: 'destructive',
      });
      return;
    }

    setCompletingPurchaseId(offerId);

    try {
      // Get the purchase data from storage (stored by buyer)
      const purchaseData = getPurchaseDataByOfferId(offerId);
      let purchaseTxHash: string | null = null;
      let purchaseId: string | null = null;
      
      if (purchaseData) {
        purchaseTxHash = purchaseData.txHash;
        purchaseId = purchaseData.purchaseId;
      } else {
        // Fallback: try to get from productId
        purchaseTxHash = getPurchaseTxHash(productId);
        purchaseId = purchaseTxHash; // Use tx hash as purchase ID if no data found
      }
      
      if (!purchaseTxHash && !purchaseId) {
        toast({
          title: 'Purchase Not Found',
          description: 'No blockchain transaction found for this purchase. The buyer may not have completed payment yet.',
          variant: 'destructive',
        });
        setCompletingPurchaseId(null);
        return;
      }
      
      // Use purchaseId if available, otherwise use txHash
      const purchaseIdToUse = purchaseId || purchaseTxHash;

      toast({
        title: 'Processing Transaction...',
        description: 'Please confirm the transaction in your wallet to receive payment.',
      });

      // Complete the purchase on blockchain (transfer funds to seller)
      const txHash = await completePurchaseTransaction(purchaseIdToUse);

      // Update offer status
      const offer = updateOfferStatus(offerId, 'completed');
      if (offer) {
        toast({
          title: 'Payment Received!',
          description: `Transaction completed! You have received the payment. TX: ${txHash.slice(0, 10)}...`,
          variant: 'default',
          className: 'bg-green-600 border-green-600 text-white'
        });
      }

      loadOffers();
    } catch (error: any) {
      console.error('Complete purchase error:', error);
      toast({
        title: 'Transaction Failed',
        description: error.message || 'Failed to complete purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCompletingPurchaseId(null);
    }
  };

  const handleRejectOffer = (offerId: string) => {
    const offer = updateOfferStatus(offerId, 'rejected');
    if (offer) {
      toast({
        title: 'Offer Rejected',
        description: 'The offer has been rejected.',
        variant: 'destructive',
      });
      loadOffers();
    }
  };

  const [counterOfferPrice, setCounterOfferPrice] = useState<string>('');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [counterDialogOpen, setCounterDialogOpen] = useState(false);
  const [completingPurchaseId, setCompletingPurchaseId] = useState<string | null>(null);

  const handleCounterOffer = (offerId: string, currentPrice: number) => {
    setSelectedOfferId(offerId);
    setCounterOfferPrice(currentPrice.toString());
    setCounterDialogOpen(true);
  };

  const submitCounterOffer = () => {
    if (!selectedOfferId || !counterOfferPrice) return;
    
    const price = parseFloat(counterOfferPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    const updated = createCounterOffer(selectedOfferId, price, 'seller');
    if (updated) {
      toast({
        title: 'Counter-Offer Sent!',
        description: `Your counter-offer of $${price} has been sent to the buyer.`,
      });
      setCounterDialogOpen(false);
      setCounterOfferPrice('');
      setSelectedOfferId(null);
      loadOffers();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send counter-offer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: Offer['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'counter-offered':
        return (
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <ArrowLeftRight className="mr-1 h-3 w-3" />
            Counter-Offered
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
            <X className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <ShoppingCart className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
    }
  };

  if (!wallet?.address) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
              <p className="text-muted-foreground">Please connect your wallet to view offers.</p>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const activeOffers = offers.filter(o => o.status === 'pending' || o.status === 'counter-offered');
  const otherOffers = offers.filter(o => o.status !== 'pending' && o.status !== 'counter-offered');

  return (
    <>
      <Header />
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold font-headline text-primary mb-1 sm:mb-2">
              Incoming Offers
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">Review and manage offers from buyers.</p>
          </div>
          <Button variant="outline" asChild className="w-full md:w-auto">
            <Link href="/seller">Back to Dashboard</Link>
          </Button>
        </div>

        {offers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Offers Yet</h2>
              <p className="text-muted-foreground">
                When buyers make offers on your products, they will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activeOffers.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Active Negotiations ({activeOffers.length})</h2>
                <div className="grid gap-4">
                  {activeOffers.map((offer) => {
                    const product = getProductById(offer.productId);
                    const latestEntry = offer.negotiationHistory[offer.negotiationHistory.length - 1];
                    const isCounterOffer = offer.status === 'counter-offered' && offer.currentCounterOffer?.from === 'seller';
                    return (
                      <Card key={offer.id} className={offer.status === 'counter-offered' ? 'border-purple-500/30' : 'border-yellow-500/30'}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {offer.productName}
                                {getStatusBadge(offer.status)}
                              </CardTitle>
                              <CardDescription className="mt-2">
                                {isCounterOffer ? 'Your counter-offer' : 'Offer from'} {formatWalletAddress(offer.buyerAddress)}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-3xl font-bold text-primary">${offer.offerPrice}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {product && `Original price: $${Math.max(...product.priceOptions)}`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {isCounterOffer ? 'Counter-offer sent' : 'Received'} {new Date(latestEntry.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Negotiation History */}
                            {offer.negotiationHistory.length > 1 && (
                              <div className="border-t pt-4">
                                <p className="text-sm font-semibold mb-2">Negotiation History:</p>
                                <div className="space-y-2">
                                  {offer.negotiationHistory.map((entry, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className={entry.from === 'buyer' ? 'text-primary' : 'text-accent'}>
                                        {entry.from === 'buyer' ? 'Buyer' : 'You'} offered: ${entry.price}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                onClick={() => handleRejectOffer(offer.id)}
                                className="text-destructive"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleCounterOffer(offer.id, offer.offerPrice)}
                              >
                                <ArrowLeftRight className="mr-2 h-4 w-4" />
                                Counter-Offer
                              </Button>
                              <Button onClick={() => handleApproveOffer(offer.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Counter-Offer Dialog */}
            <Dialog open={counterDialogOpen} onOpenChange={setCounterDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Make a Counter-Offer</DialogTitle>
                  <DialogDescription>
                    Propose a different price to the buyer. They can accept, reject, or make another counter-offer.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="counter-price">Your Counter-Offer Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="counter-price"
                        type="number"
                        placeholder="Enter your price"
                        className="pl-9"
                        value={counterOfferPrice}
                        onChange={(e) => setCounterOfferPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCounterDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={submitCounterOffer}>
                      Send Counter-Offer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {otherOffers.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Other Offers ({otherOffers.length})</h2>
                <div className="grid gap-4">
                  {otherOffers.map((offer) => {
                    const product = getProductById(offer.productId);
                    return (
                      <Card key={offer.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {offer.productName}
                                {getStatusBadge(offer.status)}
                              </CardTitle>
                              <CardDescription className="mt-2">
                                From {formatWalletAddress(offer.buyerAddress)}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-primary">${offer.offerPrice}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(offer.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {offer.status === 'approved' && (
                              <div className="flex flex-col gap-2 items-end">
                                <Badge variant="outline" className="bg-green-500/20 text-green-400">
                                  Payment Pending
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => handleCompletePurchase(offer.id, offer.productId)}
                                  disabled={completingPurchaseId === offer.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {completingPurchaseId === offer.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="mr-2 h-4 w-4" />
                                      Complete Purchase
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                            {offer.status === 'completed' && (
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                                Payment Received
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

