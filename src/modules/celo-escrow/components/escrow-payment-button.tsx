'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { createEscrow } from '../services';
import { parseEther } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EscrowPaymentButtonProps {
  productId: string;
  sellerId: string;
  amount: number; // in USD/CELO
  offerId?: string;
}

export function EscrowPaymentButton({
  productId,
  sellerId,
  amount,
  offerId,
}: EscrowPaymentButtonProps) {
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEscrowPayment = async () => {
    if (!wallet?.address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to use escrow payment.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert amount to wei (assuming 1 CELO = 1 USD for simplicity)
      const amountInWei = parseEther(amount.toString());

      const result = await createEscrow({
        buyerAddress: wallet.address,
        sellerAddress: sellerId as `0x${string}`,
        amount: amountInWei.toString(),
        productId,
        offerId,
      });

      toast({
        title: 'Escrow Created',
        description: 'Funds are now locked in escrow. Complete the purchase to release funds.',
      });

      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: 'Escrow Failed',
        description: error.message || 'Failed to create escrow',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-primary/30 hover:bg-primary/10"
        onClick={() => setIsOpen(true)}
      >
        <Shield className="mr-2 h-4 w-4" />
        Pay with CELO (Escrow)
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CELO Escrow Payment</DialogTitle>
            <DialogDescription>
              Secure payment using CELO blockchain escrow. Funds will be locked until you confirm delivery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="text"
                value={`${amount} CELO`}
                disabled
                className="font-mono"
              />
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                <strong>How it works:</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Your CELO will be locked in a smart contract</li>
                <li>Seller delivers the item</li>
                <li>You confirm delivery to release funds</li>
                <li>If there's an issue, you can request a refund</li>
              </ul>
            </div>

            <Button
              onClick={handleEscrowPayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Create Escrow
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

