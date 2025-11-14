'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Send, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface ActionButtonsProps {
  selectedPrice: number | null;
  customOffer: string;
  bargainState: 'idle' | 'proposed' | 'approved' | 'sold';
  setBargainState: (
    state: 'idle' | 'proposed' | 'approved' | 'sold'
  ) => void;
  setFinalPrice: (price: number | null) => void;
}

export function ActionButtons({
  selectedPrice,
  customOffer,
  bargainState,
  setBargainState,
  setFinalPrice,
}: ActionButtonsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const offerPrice = customOffer ? parseFloat(customOffer) : null;
  const canPropose = selectedPrice !== null || (offerPrice && offerPrice > 0);

  const handlePropose = () => {
    const price = selectedPrice || offerPrice;
    if (price) {
      setFinalPrice(price);
      setBargainState('proposed');
      toast({
        title: 'Offer Sent!',
        description: `Your offer of $${price} has been sent to the seller.`,
      });
    }
  };

  const handleSellerApprove = () => {
    setIsLoading(true);
    setTimeout(() => {
      setBargainState('approved');
      toast({
        title: 'Offer Approved!',
        description: 'The seller has accepted your offer. You can now purchase the item.',
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleBuy = () => {
    setIsLoading(true);
    setTimeout(() => {
      setBargainState('sold');
      toast({
        title: 'Transaction Successful!',
        description: `Congratulations on your purchase!`,
        variant: 'default',
        className: 'bg-green-600 border-green-600 text-white'
      });
      setIsLoading(false);
    }, 2000);
  };

  if (bargainState === 'sold') {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-green-500 bg-card p-4 text-lg font-semibold text-green-400">
        <Check className="h-6 w-6" />
        <span>Purchase Complete!</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bargainState === 'idle' && (
        <Button
          size="lg"
          className="w-full text-lg"
          disabled={!canPropose}
          onClick={handlePropose}
        >
          <Send className="mr-2 h-5 w-5" /> Propose Price
        </Button>
      )}

      {bargainState === 'proposed' && (
        <div className="space-y-3">
          <Badge
            variant="default"
            className="w-full justify-center bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-base"
          >
            Offer of ${finalPrice} sent. Waiting for seller approval...
          </Badge>
          <Button
            size="lg"
            variant="outline"
            className="w-full text-lg"
            onClick={handleSellerApprove}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Check className="mr-2 h-5 w-5" />
            )}
            (Simulate) Seller Approves
          </Button>
        </div>
      )}

      {bargainState === 'approved' && (
        <Button size="lg" className="w-full text-lg" onClick={handleBuy} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <ShoppingCart className="mr-2 h-5 w-5" />
          )}
          Buy Now for ${finalPrice}
        </Button>
      )}
    </div>
  );
}
