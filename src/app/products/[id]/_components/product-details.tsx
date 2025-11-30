'use client';

import type { Product, Seller } from '@/lib/types';
import { useState } from 'react';
import { ImageCarousel } from './image-carousel';
import { PriceSelector } from './price-selector';
import { SellerProfile } from './seller-profile';
import { ActionButtons } from './action-buttons';
import { ReviewSection } from './review-section';

interface ProductDetailsProps {
  product: Product & { reviews: any[] };
  seller: Seller;
}

export function ProductDetails({ product, seller }: ProductDetailsProps) {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [customOffer, setCustomOffer] = useState<string>('');
  const [bargainState, setBargainState] = useState<
    'idle' | 'proposed' | 'approved' | 'sold'
  >('idle');
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  const handlePriceSelection = (price: number | 'custom', customValue?: string) => {
    if (price === 'custom') {
      setSelectedPrice(null);
      setCustomOffer(customValue || '');
    } else {
      setSelectedPrice(price);
      setCustomOffer('');
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 md:gap-12 lg:gap-16 perspective-1000">
      <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:gap-12">
        <div className="flex items-start animate-slide-in-3d">
          <ImageCarousel images={product.images} productName={product.name} />
        </div>
        <div className="flex flex-col gap-4 sm:gap-6 animate-slide-in-3d" style={{ animationDelay: '0.2s' }}>
          <SellerProfile seller={seller} />
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-gradient-animated">
              {product.name}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">{product.description}</p>
          </div>
          <PriceSelector
            priceOptions={product.priceOptions}
            onPriceSelect={handlePriceSelection}
            bargainState={bargainState}
            finalPrice={finalPrice}
          />
          <ActionButtons
            selectedPrice={selectedPrice}
            customOffer={customOffer}
            bargainState={bargainState}
            setBargainState={setBargainState}
            finalPrice={finalPrice}
            setFinalPrice={setFinalPrice}
            productId={product.id}
            sellerId={product.sellerId}
            currentProductPrice={product.priceOptions[0] || 0}
          />
        </div>
      </div>
      <div className="animate-slide-in-3d" style={{ animationDelay: '0.4s' }}>
        <ReviewSection product={product} />
      </div>
    </div>
  );
}
