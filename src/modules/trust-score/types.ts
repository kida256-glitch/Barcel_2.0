export interface TrustScore {
  score: number; // 0-100
  level: 'new' | 'bronze' | 'silver' | 'gold' | 'platinum';
  successfulEscrows: number;
  disputes: number;
  completedNegotiations: number;
  deliveryConfirmations: number;
}

