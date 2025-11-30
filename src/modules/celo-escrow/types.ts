export interface EscrowRequest {
  buyerAddress: string;
  sellerAddress: string;
  amount: string; // in wei
  productId: string;
  offerId?: string;
}

export interface EscrowResponse {
  success: boolean;
  escrowId: string;
  transactionHash?: string;
  message?: string;
}

export interface EscrowStatus {
  escrowId: string;
  buyer: string;
  seller: string;
  amount: string;
  status: 'pending' | 'released' | 'refunded' | 'cancelled';
  createdAt: string;
  productId: string;
}

