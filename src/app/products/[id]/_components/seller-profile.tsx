import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Seller } from '@/lib/types';
import { Star } from 'lucide-react';

interface SellerProfileProps {
  seller: Seller;
}

export function SellerProfile({ seller }: SellerProfileProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={seller.avatar} alt={seller.name} data-ai-hint="person portrait" />
        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h2 className="font-bold text-lg">{seller.name}</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{seller.rating.toFixed(1)}</span>
            </div>
            <Badge variant="outline">
                {seller.successRate}% Success Rate
            </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{seller.bio}</p>
      </div>
    </div>
  );
}
