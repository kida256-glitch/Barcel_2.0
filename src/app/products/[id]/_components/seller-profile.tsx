'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Seller } from '@/lib/types';
import { getSellerOverallRating, getSellerLoyaltyPoints, getSellerLoyaltyTier } from '@/lib/store';
import { Star, Award, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface SellerProfileProps {
  seller: Seller;
}

export function SellerProfile({ seller }: SellerProfileProps) {
  const { rating, totalReviews } = useMemo(() => getSellerOverallRating(seller.id), [seller.id]);
  const loyaltyPoints = useMemo(() => getSellerLoyaltyPoints(seller.id), [seller.id]);
  const loyaltyTier = useMemo(() => getSellerLoyaltyTier(loyaltyPoints), [loyaltyPoints]);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm p-5 shadow-lg shadow-primary/5 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 card-3d animate-slide-in-3d">
      <div className="relative">
        <Avatar className="h-20 w-20 border-2 border-primary/30 ring-2 ring-accent/20 transition-all duration-300 hover:scale-110 hover:ring-accent/40">
          <AvatarImage src={seller.avatar} alt={seller.name} data-ai-hint="person portrait" />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xl">
            {seller.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-400 border-2 border-background animate-pulse shadow-lg shadow-green-400/50" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h2 className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {seller.name}
          </h2>
          {loyaltyPoints > 0 && (
            <Badge className={`${loyaltyTier.color} bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 flex items-center gap-1`}>
              <Award className="h-3 w-3" />
              {loyaltyTier.tier}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
          {rating > 0 ? (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <Star className="w-4 h-4 text-yellow-400 fill-current animate-pulse-3d" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
                {totalReviews > 0 && (
                  <span className="text-xs text-muted-foreground">({totalReviews})</span>
                )}
              </div>
              {loyaltyPoints > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-400">{loyaltyPoints} pts</span>
                </div>
              )}
            </>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              No ratings yet
            </Badge>
          )}
          <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all duration-300 hover:scale-105">
            {seller.successRate}% Success Rate
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{seller.bio}</p>
      </div>
    </div>
  );
}
