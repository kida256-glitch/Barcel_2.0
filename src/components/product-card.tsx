import type { Product } from '@/lib/types';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from './ui/badge';
import { getSellerById } from '@/lib/sellers';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const seller = getSellerById(product.sellerId);
  const lowestPrice = Math.min(...product.priceOptions);

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border bg-gradient-to-br from-card to-card/80 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/30 card-3d animate-slide-in-3d">
      <CardHeader className="p-0 perspective-1000">
        <div className="relative h-56 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            data-ai-hint="product image"
          />
          <div className="absolute top-3 right-3 z-20">
            <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-5 space-y-2">
        <h3 className="font-bold font-headline text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent animate-pulse" />
          by {seller?.name}
        </p>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Badge 
          variant="secondary" 
          className="text-base font-semibold bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 hover:from-primary/30 hover:to-accent/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
        >
          From ${lowestPrice}
        </Badge>
      </CardFooter>
    </Card>
  );
}
