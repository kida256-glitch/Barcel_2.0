import { getProductById, getSellerById, products } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ProductDetails } from './_components/product-details';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  const seller = getSellerById(product.sellerId);

  if (!seller) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <ProductDetails product={product} seller={seller} />
    </div>
  );
}
