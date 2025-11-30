'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, MessageSquare, TrendingDown } from 'lucide-react';
import { startNegotiation } from '../services';
import type { NegotiationStyle, NegotiationStep } from '../types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface NegotiationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  sellerId: string;
  currentPrice: number;
  buyerAddress: string;
}

export function NegotiationModal({
  open,
  onOpenChange,
  productId,
  sellerId,
  currentPrice,
  buyerAddress,
}: NegotiationModalProps) {
  const [style, setStyle] = useState<NegotiationStyle>('polite');
  const [targetPrice, setTargetPrice] = useState<string>(currentPrice.toString());
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [steps, setSteps] = useState<NegotiationStep[]>([]);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [finalOffer, setFinalOffer] = useState<{ price: number; message: string; accepted: boolean } | null>(null);
  const { toast } = useToast();

  const handleStartNegotiation = async () => {
    const target = parseFloat(targetPrice);
    if (isNaN(target) || target <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid target price.',
        variant: 'destructive',
      });
      return;
    }

    if (target >= currentPrice) {
      toast({
        title: 'Invalid Target',
        description: 'Target price must be less than current price.',
        variant: 'destructive',
      });
      return;
    }

    setIsNegotiating(true);
    setSteps([]);
    setFinalPrice(null);
    setFinalOffer(null);

    try {
      const result = await startNegotiation({
        productId,
        sellerId,
        currentPrice,
        targetPrice: target,
        style,
        buyerAddress,
      });

      setSteps(result.steps);
      setFinalPrice(result.finalPrice);
      setFinalOffer(result.finalOffer);

      toast({
        title: 'Negotiation Complete',
        description: result.finalOffer.accepted
          ? `Seller accepted your offer of $${result.finalPrice.toFixed(2)}`
          : `Final offer: $${result.finalPrice.toFixed(2)}`,
      });
    } catch (error: any) {
      toast({
        title: 'Negotiation Failed',
        description: error.message || 'Failed to start negotiation',
        variant: 'destructive',
      });
    } finally {
      setIsNegotiating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Negotiation
          </DialogTitle>
          <DialogDescription>
            Let AI negotiate on your behalf. Select your style and target price.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {steps.length === 0 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="style">Negotiation Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as NegotiationStyle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="polite">Polite - Friendly and respectful</SelectItem>
                    <SelectItem value="firm">Firm - Direct and assertive</SelectItem>
                    <SelectItem value="aggressive">Aggressive - Push for best deal</SelectItem>
                    <SelectItem value="funny">Funny - Light-hearted and humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetPrice">Target Price</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    id="targetPrice"
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    min="0"
                    max={currentPrice}
                    step="0.01"
                    placeholder="Enter target price"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Current price: ${currentPrice.toFixed(2)}
                </p>
              </div>

              <Button
                onClick={handleStartNegotiation}
                disabled={isNegotiating}
                className="w-full"
              >
                {isNegotiating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Negotiating...
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Start Negotiation
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <Card
                      key={index}
                      className={`${
                        step.from === 'buyer'
                          ? 'bg-primary/10 border-primary/20'
                          : 'bg-accent/10 border-accent/20'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase">
                              {step.from === 'buyer' ? 'You' : 'Seller'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Step {step.step}
                            </span>
                          </div>
                          <span className="text-sm font-bold">
                            ${step.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm">{step.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {finalOffer && (
                <Card className="border-2 border-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Final Offer</h3>
                      <span className="text-lg font-bold text-primary">
                        ${finalPrice?.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {finalOffer.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          finalOffer.accepted
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {finalOffer.accepted ? 'Accepted' : 'Pending'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={() => {
                  setSteps([]);
                  setFinalPrice(null);
                  setFinalOffer(null);
                }}
                variant="outline"
                className="w-full"
              >
                Start New Negotiation
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

