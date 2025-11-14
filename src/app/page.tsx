import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/data';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold font-headline text-primary">
        Explore Products
      </h1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Link
            href={`/products/${product.id}`}
            key={product.id}
            className="group"
          >
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </div>
  );
}
