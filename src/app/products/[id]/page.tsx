'use client';

import { getProductById } from '@/lib/store';
import { notFound } from 'next/navigation';
import { ProductDetails } from './_components/product-details';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import type { Review } from '@/lib/types';
import { Header } from '@/components/header';
import { getSellerById } from '@/lib/sellers';
import type { Seller } from '@/lib/types';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<(Product & { reviews: Review[] }) | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setProductId(id);
      const foundProduct = getProductById(id);
      if (foundProduct) {
        setProduct(foundProduct);
        // Get seller from store (creates default if not exists)
        const foundSeller = getSellerById(foundProduct.sellerId);
        setSeller(foundSeller);
      }
      setLoading(false);
    });
  }, [params]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto max-w-6xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          <div className="text-center py-8 sm:py-12">Loading...</div>
        </div>
      </>
    );
  }

  if (!product || !seller) {
    notFound();
  }

  return (
      <>
        <Header />
        <div className="container mx-auto max-w-6xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          <ProductDetails product={product} seller={seller} />
        </div>
      </>
  );
}
