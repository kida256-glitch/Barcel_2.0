import type { Product } from '@/lib/types';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from './ui/badge';
import { getSellerById } from '@/lib/data';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const seller = getSellerById(product.sellerId);
  const lowestPrice = Math.min(...product.priceOptions);

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border transition-all group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            data-ai-hint="product image"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <h3 className="mb-1 font-bold font-headline">{product.name}</h3>
        <p className="text-sm text-muted-foreground">by {seller?.name}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Badge variant="secondary" className="text-base">
          From ${lowestPrice}
        </Badge>
      </CardFooter>
    </Card>
  );
}
