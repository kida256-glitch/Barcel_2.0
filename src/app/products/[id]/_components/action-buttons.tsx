'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Loader2, Send, ShoppingCart, ArrowLeftRight, DollarSign, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createOffer, getOffersByBuyer, updateOfferStatus, getLatestOfferForProduct, createCounterOffer } from '@/lib/store';
import { useWallet } from '@/hooks/use-wallet';
import { NegotiationModal } from '@/modules/ai-negotiation/components/negotiation-modal';
import { EscrowPaymentButton } from '@/modules/celo-escrow/components/escrow-payment-button';

interface ActionButtonsProps {
  selectedPrice: number | null;
  customOffer: string;
  bargainState: 'idle' | 'proposed' | 'approved' | 'sold' | 'counter-offered';
  setBargainState: (
    state: 'idle' | 'proposed' | 'approved' | 'sold' | 'counter-offered'
  ) => void;
  finalPrice: number | null;
  setFinalPrice: (price: number | null) => void;
  productId: string;
  sellerId: string;
  currentProductPrice: number;
}

export function ActionButtons({
  selectedPrice,
  customOffer,
  bargainState,
  setBargainState,
  finalPrice,
  setFinalPrice,
  productId,
  sellerId,
  currentProductPrice,
}: ActionButtonsProps) {
  const { toast } = useToast();
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [counterOfferPrice, setCounterOfferPrice] = useState<string>('');
  const [counterDialogOpen, setCounterDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<any>(null);
  const [negotiationModalOpen, setNegotiationModalOpen] = useState(false);
  const offerPrice = customOffer ? parseFloat(customOffer) : null;
  const canPropose = selectedPrice !== null || (offerPrice && offerPrice > 0);

  // Check for existing offers for this product
  useEffect(() => {
    if (wallet?.address) {
      const checkOffers = () => {
        const offer = getLatestOfferForProduct(productId, wallet.address!);
        if (offer) {
          setCurrentOffer(offer);
          setFinalPrice(offer.offerPrice);
          
          if (offer.status === 'approved') {
            setBargainState('approved');
          } else if (offer.status === 'counter-offered' && offer.currentCounterOffer?.from === 'seller') {
            setBargainState('counter-offered');
          } else if (offer.status === 'pending' || offer.status === 'counter-offered') {
            setBargainState('proposed');
          }
        }
      };
      
      checkOffers();
      // Check periodically for status updates (when seller responds)
      const interval = setInterval(checkOffers, 2000);
      return () => clearInterval(interval);
    }
  }, [wallet?.address, productId, setBargainState, setFinalPrice]);

  const handlePropose = () => {
    if (!wallet?.address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to make an offer.',
        variant: 'destructive',
      });
      return;
    }

    const price = selectedPrice || offerPrice;
    if (price) {
      try {
        // If there's an existing offer, create a counter-offer instead
        if (currentOffer) {
          const updated = createCounterOffer(currentOffer.id, price, 'buyer');
          if (updated) {
            setFinalPrice(price);
            setBargainState('proposed');
            toast({
              title: 'Counter-Offer Sent!',
              description: `Your counter-offer of $${price} has been sent to the seller.`,
            });
          }
        } else {
          createOffer({
            productId,
            sellerId,
            buyerAddress: wallet.address,
            offerPrice: price,
          });
          setFinalPrice(price);
          setBargainState('proposed');
          toast({
            title: 'Offer Sent!',
            description: `Your offer of $${price} has been sent to the seller. They will be notified.`,
          });
        }
      } catch (error) {
        console.error('Error creating offer:', error);
        toast({
          title: 'Error',
          description: 'Failed to send offer. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCounterOffer = () => {
    if (currentOffer) {
      setCounterOfferPrice(currentOffer.offerPrice.toString());
      setCounterDialogOpen(true);
    }
  };

  const submitCounterOffer = () => {
    if (!currentOffer || !counterOfferPrice) return;
    
    const price = parseFloat(counterOfferPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    const updated = createCounterOffer(currentOffer.id, price, 'buyer');
    if (updated) {
      toast({
        title: 'Counter-Offer Sent!',
        description: `Your counter-offer of $${price} has been sent to the seller.`,
      });
      setCounterDialogOpen(false);
      setCounterOfferPrice('');
      setFinalPrice(price);
      setBargainState('proposed');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send counter-offer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptCounterOffer = () => {
    if (!currentOffer) return;
    
    const updated = updateOfferStatus(currentOffer.id, 'approved');
    if (updated) {
      setBargainState('approved');
      toast({
        title: 'Counter-Offer Accepted!',
        description: `You've accepted the seller's counter-offer of $${currentOffer.offerPrice}. You can now complete the purchase.`,
      });
    }
  };

  const handleBuy = async () => {
    if (!wallet?.address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to complete the purchase.',
        variant: 'destructive',
      });
      return;
    }

    if (!finalPrice || finalPrice <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please ensure a valid price is set.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Import contract functions
      const { createPurchaseTransaction } = await import('@/lib/contract');
      
      // Convert sellerId to address format (assuming sellerId is already an address)
      const sellerAddress = sellerId as `0x${string}`;
      
      toast({
        title: 'Processing Transaction...',
        description: 'Please confirm the transaction in your wallet.',
      });

      // Create purchase transaction on blockchain
      const { purchaseId, txHash } = await createPurchaseTransaction(
        sellerAddress,
        productId,
        finalPrice
      );

      // Find and update the offer
      const buyerOffers = getOffersByBuyer(wallet.address);
      const offer = buyerOffers.find(
        o => o.productId === productId && o.status === 'approved'
      );
      
      if (offer) {
        updateOfferStatus(offer.id, 'completed');
      }

      // Store purchase information for seller to complete
      if (typeof window !== 'undefined' && currentOffer) {
        const { storePurchaseData } = await import('@/lib/purchase-tracker');
        storePurchaseData({
          offerId: currentOffer.id,
          productId: productId,
          sellerId: sellerId,
          buyerAddress: wallet.address,
          amount: finalPrice,
          txHash: txHash,
          purchaseId: purchaseId,
          timestamp: new Date().toISOString(),
        });
      }

      setBargainState('sold');
      toast({
        title: 'Transaction Successful!',
        description: `Payment of ${finalPrice} CELO sent! Transaction: ${txHash.slice(0, 10)}...`,
        variant: 'default',
        className: 'bg-green-600 border-green-600 text-white'
      });
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: 'Transaction Failed',
        description: error.message || 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (bargainState === 'sold') {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-green-500 bg-card p-4 text-lg font-semibold text-green-400">
        <Check className="h-6 w-6" />
        <span>Purchase Complete!</span>
      </div>
    );
  }

  // Get current price for negotiation
  const currentPrice = finalPrice || selectedPrice || offerPrice || currentProductPrice;

  return (
    <div className="space-y-4 animate-slide-in-3d">
      {bargainState === 'idle' && (
        <>
          <Button
            size="lg"
            className="w-full text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canPropose}
            onClick={handlePropose}
          >
            <Send className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" /> 
            Propose Price
          </Button>
          {wallet?.address && (
            <Button
              variant="outline"
              size="lg"
              className="w-full text-lg border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-105"
              onClick={() => setNegotiationModalOpen(true)}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Negotiate with AI
            </Button>
          )}
        </>
      )}

      {bargainState === 'proposed' && (
        <div className="space-y-3">
          <Badge
            variant="default"
            className="w-full justify-center bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-base"
          >
            Offer of ${finalPrice ?? 0} sent. Waiting for seller response...
          </Badge>
          <p className="text-sm text-muted-foreground text-center">
            The seller will review your offer and can accept, reject, or make a counter-offer.
          </p>
        </div>
      )}

      {bargainState === 'counter-offered' && currentOffer && (
        <div className="space-y-4">
          <div className="space-y-3 p-4 rounded-lg border-2 border-purple-500/30 bg-purple-500/5">
            <Badge
              variant="default"
              className="w-full justify-center bg-purple-500/20 text-purple-400 border-purple-500/30 text-base"
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Seller's Counter-Offer: ${currentOffer.offerPrice}
            </Badge>
            
            {/* Negotiation History */}
            {currentOffer.negotiationHistory.length > 1 && (
              <div className="border-t border-purple-500/20 pt-3 mt-3">
                <p className="text-xs font-semibold mb-2 text-purple-300">Negotiation History:</p>
                <div className="space-y-1">
                  {currentOffer.negotiationHistory.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className={entry.from === 'buyer' ? 'text-primary' : 'text-accent'}>
                        {entry.from === 'buyer' ? 'You' : 'Seller'} offered: ${entry.price}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <Button
                variant="outline"
                className="flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50"
                onClick={handleCounterOffer}
              >
                <ArrowLeftRight className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                Counter-Offer
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30"
                onClick={handleAcceptCounterOffer}
              >
                <Check className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Counter-Offer Dialog */}
      <Dialog open={counterDialogOpen} onOpenChange={setCounterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Counter-Offer</DialogTitle>
            <DialogDescription>
              Propose a different price to the seller. They can accept, reject, or make another counter-offer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="buyer-counter-price">Your Counter-Offer Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="buyer-counter-price"
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

      {bargainState === 'approved' && (
        <div className="space-y-3">
          <Button 
            size="lg" 
            className="w-full text-lg bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/40 animate-pulse-3d" 
            onClick={handleBuy} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-125" />
            )}
            Buy Now for ${finalPrice ?? 0}
          </Button>
          {wallet?.address && finalPrice && (
            <EscrowPaymentButton
              productId={productId}
              sellerId={sellerId}
              amount={finalPrice}
              offerId={currentOffer?.id}
            />
          )}
        </div>
      )}

      {/* AI Negotiation Modal */}
      {wallet?.address && (
        <NegotiationModal
          open={negotiationModalOpen}
          onOpenChange={setNegotiationModalOpen}
          productId={productId}
          sellerId={sellerId}
          currentPrice={currentPrice}
          buyerAddress={wallet.address}
        />
      )}
    </div>
  );
}
