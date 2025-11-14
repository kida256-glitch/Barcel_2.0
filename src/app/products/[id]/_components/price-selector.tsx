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
      <div className="space-y-2">
        <h2 className="font-semibold text-accent">Agreed Price</h2>
        <p className="text-4xl font-bold text-white">${finalPrice}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-accent">Choose Your Price</h2>
      <RadioGroup
        onValueChange={(value) =>
          onPriceSelect(value === 'custom' ? 'custom' : Number(value))
        }
        className="grid grid-cols-2 gap-4 md:grid-cols-3"
        disabled={bargainState === 'proposed'}
      >
        {priceOptions.map((price) => (
          <Label
            key={price}
            htmlFor={`price-${price}`}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary',
              bargainState === 'proposed' && 'cursor-not-allowed opacity-50'
            )}
          >
            <RadioGroupItem
              value={String(price)}
              id={`price-${price}`}
              className="sr-only"
            />
            <span className="text-2xl font-bold">${price}</span>
          </Label>
        ))}
        <Label
          htmlFor="price-custom"
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary',
            bargainState === 'proposed' && 'cursor-not-allowed opacity-50'
          )}
        >
          <RadioGroupItem
            value="custom"
            id="price-custom"
            className="sr-only"
          />
          <Tag className="mb-1 h-6 w-6" />
          <span className="font-semibold">Make Offer</span>
        </Label>
      </RadioGroup>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-muted-foreground sm:text-sm">$</span>
        </div>
        <Input
          type="number"
          placeholder="Enter your offer"
          className="pl-7"
          onChange={(e) => onPriceSelect('custom', e.target.value)}
          disabled={bargainState === 'proposed'}
        />
      </div>
    </div>
  );
}
