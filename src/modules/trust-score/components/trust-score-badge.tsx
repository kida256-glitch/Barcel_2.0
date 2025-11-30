'use client';

import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { TrustScore } from '../types';

interface TrustScoreBadgeProps {
  trustScore: TrustScore;
  showDetails?: boolean;
}

export function TrustScoreBadge({ trustScore, showDetails = false }: TrustScoreBadgeProps) {
  const getLevelColor = (level: TrustScore['level']) => {
    switch (level) {
      case 'platinum':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'gold':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'silver':
        return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
      case 'bronze':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const stars = Math.floor(trustScore.score / 20); // 0-5 stars

  return (
    <div className="flex items-center gap-2">
      <Badge className={getLevelColor(trustScore.level)}>
        <Star className="h-3 w-3 mr-1 fill-current" />
        Trust Score: {trustScore.score}/100
      </Badge>
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          {trustScore.successfulEscrows} escrows • {trustScore.completedNegotiations} negotiations
        </div>
      )}
    </div>
  );
}

