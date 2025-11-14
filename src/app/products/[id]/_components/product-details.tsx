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
    <div className="flex flex-col gap-12 lg:gap-16">
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <div className="flex items-start">
          <ImageCarousel images={product.images} productName={product.name} />
        </div>
        <div className="flex flex-col gap-6">
          <SellerProfile seller={seller} />
          <div>
            <h1 className="text-3xl font-bold font-headline text-white lg:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
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
            setFinalPrice={setFinalPrice}
          />
        </div>
      </div>
      <ReviewSection product={product} />
    </div>
  );
}
