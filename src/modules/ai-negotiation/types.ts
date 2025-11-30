export type NegotiationStyle = 'polite' | 'firm' | 'aggressive' | 'funny';

export interface NegotiationRequest {
  productId: string;
  sellerId: string;
  currentPrice: number;
  targetPrice: number;
  style: NegotiationStyle;
  buyerAddress: string;
}

export interface NegotiationStep {
  step: number;
  from: 'buyer' | 'seller';
  message: string;
  price: number;
  timestamp: string;
}

export interface NegotiationResponse {
  success: boolean;
  steps: NegotiationStep[];
  finalPrice: number;
  finalOffer: {
    price: number;
    message: string;
    accepted: boolean;
  };
  negotiationId: string;
}

