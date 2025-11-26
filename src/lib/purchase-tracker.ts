'use client';

/**
 * Helper functions to track purchases between buyer and seller
 */

export interface PurchaseData {
  offerId: string;
  productId: string;
  sellerId: string;
  buyerAddress: string;
  amount: number;
  txHash: string;
  purchaseId: string;
  timestamp: string;
}

/**
 * Store purchase data for seller to complete
 */
export function storePurchaseData(data: PurchaseData): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Store by offer ID (for seller to find)
    localStorage.setItem(`purchase_${data.offerId}`, JSON.stringify(data));
    // Also store by product ID (fallback)
    localStorage.setItem(`purchase_tx_${data.productId}`, data.txHash);
    // Store by buyer address and product (for buyer to track)
    localStorage.setItem(`buyer_purchase_${data.buyerAddress}_${data.productId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing purchase data:', error);
  }
}

/**
 * Get purchase data by offer ID
 */
export function getPurchaseDataByOfferId(offerId: string): PurchaseData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(`purchase_${offerId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading purchase data:', error);
    return null;
  }
}

/**
 * Get purchase data by product ID and buyer
 */
export function getPurchaseDataByProduct(buyerAddress: string, productId: string): PurchaseData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(`buyer_purchase_${buyerAddress}_${productId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading purchase data:', error);
    return null;
  }
}

/**
 * Get purchase transaction hash by product ID
 */
export function getPurchaseTxHash(productId: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(`purchase_tx_${productId}`);
  } catch (error) {
    console.error('Error reading purchase tx hash:', error);
    return null;
  }
}

