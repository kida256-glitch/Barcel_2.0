'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

interface PriceSelectorProps {
  priceOptions: number[];
  onPriceSelect: (price: number | 'custom', customValue?: string) => void;
  bargainState: string;
  finalPrice: number | null;
}

export function PriceSelector({
  priceOptions,
  onPriceSelect,
  bargainState,
  finalPrice,
}: PriceSelectorProps) {
  const isBargainingFinished =
    bargainState === 'approved' || bargainState === 'sold';

  if (isBargainingFinished) {
    return (
      <div className="space-y-3 p-6 rounded-lg border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 animate-slide-in-3d">
        <h2 className="font-semibold text-green-400 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          Agreed Price
        </h2>
        <p className="text-5xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent animate-pulse-3d">
          ${finalPrice ?? 0}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-in-3d">
      <h2 className="font-semibold text-xl bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
        Choose Your Price
      </h2>
      <RadioGroup
        onValueChange={(value) =>
          onPriceSelect(value === 'custom' ? 'custom' : Number(value))
        }
        className="grid grid-cols-2 gap-4 md:grid-cols-3"
        disabled={bargainState === 'proposed'}
      >
        {priceOptions.map((price, index) => (
          <Label
            key={price}
            htmlFor={`price-${price}`}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted bg-gradient-to-br from-popover to-popover/80 p-5 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-gradient-to-br [&:has([data-state=checked])]:from-primary/20 [&:has([data-state=checked])]:to-accent/20 [&:has([data-state=checked])]:shadow-xl [&:has([data-state=checked])]:shadow-primary/30 card-3d',
              bargainState === 'proposed' && 'cursor-not-allowed opacity-50'
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <RadioGroupItem
              value={String(price)}
              id={`price-${price}`}
              className="sr-only"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ${price}
            </span>
          </Label>
        ))}
        <Label
          htmlFor="price-custom"
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-gradient-to-br from-popover to-popover/80 p-5 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-gradient-to-br [&:has([data-state=checked])]:from-primary/20 [&:has([data-state=checked])]:to-accent/20 [&:has([data-state=checked])]:shadow-xl [&:has([data-state=checked])]:shadow-primary/30 card-3d',
            bargainState === 'proposed' && 'cursor-not-allowed opacity-50'
          )}
        >
          <RadioGroupItem
            value="custom"
            id="price-custom"
            className="sr-only"
          />
          <Tag className="mb-2 h-6 w-6 text-accent transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-semibold">Make Offer</span>
        </Label>
      </RadioGroup>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-muted-foreground sm:text-sm font-semibold">$</span>
        </div>
        <Input
          type="number"
          placeholder="Enter your offer"
          className="pl-7 border-primary/20 bg-gradient-to-r from-background to-background/50 focus:border-primary focus:ring-primary/20 transition-all duration-300 hover:border-primary/40"
          onChange={(e) => onPriceSelect('custom', e.target.value)}
          disabled={bargainState === 'proposed'}
        />
      </div>
    </div>
  );
}
