'use client';

import type { Product, Review } from './types';

// In-memory store with localStorage persistence
let productsStore: (Product & { reviews: Review[] })[] = [];
let offersStore: Offer[] = [];

export interface NegotiationEntry {
  price: number;
  from: 'buyer' | 'seller';
  timestamp: string;
  message?: string;
}

export interface Offer {
  id: string;
  productId: string;
  productName: string;
  buyerAddress: string;
  offerPrice: number;
  status: 'pending' | 'counter-offered' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  sellerId: string;
  negotiationHistory: NegotiationEntry[];
  currentCounterOffer?: {
    price: number;
    from: 'buyer' | 'seller';
    timestamp: string;
  };
}

// Initialize store from localStorage
export function initializeStore() {
  if (typeof window !== 'undefined') {
    try {
      const storedProducts = localStorage.getItem('celobargain_products');
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        // Filter out old dummy products (products with IDs like 'product-1', 'product-2', etc.)
        // Only keep products that were actually added by sellers (they have IDs like 'product-{timestamp}-{random}')
        const filtered = parsed.filter((product: any) => {
          // Old dummy products have simple IDs like 'product-1', 'product-2', etc.
          // Real products have IDs like 'product-1234567890-abc123'
          if (!product.id || typeof product.id !== 'string') return false;
          const idParts = product.id.split('-');
          // If ID has only 2 parts (product-1), it's likely dummy data
          // Real products have 3+ parts (product-timestamp-random)
          // Check if second part is a number (old dummy) or a long timestamp (real product)
          if (idParts.length < 3) return false;
          const secondPart = idParts[1];
          // If second part is a short number (1-4 digits), it's likely dummy data
          // Real timestamps are 13 digits (milliseconds since epoch)
          return secondPart.length >= 10 && !isNaN(Number(secondPart));
        });
        productsStore = filtered;
        // Save the filtered products back to localStorage if any were removed
        if (filtered.length !== parsed.length) {
          localStorage.setItem('celobargain_products', JSON.stringify(productsStore));
        }
      } else {
        // Start with empty store - no dummy data
        productsStore = [];
      }

      const storedOffers = localStorage.getItem('celobargain_offers');
      if (storedOffers) {
        const parsed = JSON.parse(storedOffers);
        // Migrate old offers to new format
        offersStore = parsed.map((offer: any) => {
          if (!offer.negotiationHistory) {
            return {
              ...offer,
              negotiationHistory: [{
                price: offer.offerPrice,
                from: 'buyer',
                timestamp: offer.createdAt,
              }],
              currentCounterOffer: undefined,
            };
          }
          return offer;
        });
        saveOffers(); // Save migrated offers
      }
    } catch (error) {
      console.error('Error loading store:', error);
    }
  }
}

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  initializeStore();
}

function saveProducts() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('celobargain_products', JSON.stringify(productsStore));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }
}

function saveOffers() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('celobargain_offers', JSON.stringify(offersStore));
    } catch (error) {
      console.error('Error saving offers:', error);
    }
  }
}

// Product functions
export function getAllProducts(): (Product & { reviews: Review[] })[] {
  return productsStore;
}

export function getProductById(id: string): (Product & { reviews: Review[] }) | undefined {
  return productsStore.find(p => p.id === id);
}

export function addProduct(product: Omit<Product, 'id'> & { reviews?: Review[] }): Product & { reviews: Review[] } {
  const newProduct: Product & { reviews: Review[] } = {
    ...product,
    id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    reviews: product.reviews || [],
  };
  productsStore.push(newProduct);
  saveProducts();
  return newProduct;
}

export function getProductsBySeller(sellerId: string): (Product & { reviews: Review[] })[] {
  return productsStore.filter(p => p.sellerId === sellerId);
}

export function updateProduct(productId: string, updates: Partial<Product>): (Product & { reviews: Review[] }) | null {
  const productIndex = productsStore.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return null;
  }
  
  productsStore[productIndex] = {
    ...productsStore[productIndex],
    ...updates,
  };
  saveProducts();
  return productsStore[productIndex];
}

export function deleteProduct(productId: string): boolean {
  const productIndex = productsStore.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return false;
  }

  productsStore.splice(productIndex, 1);
  saveProducts();
  return true;
}

// Review functions
export function addReview(productId: string, review: Omit<Review, 'id' | 'createdAt'>): Review | null {
  const product = productsStore.find(p => p.id === productId);
  if (!product) {
    return null;
  }

  const newReview: Review = {
    ...review,
    id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  product.reviews = product.reviews || [];
  product.reviews.push(newReview);
  saveProducts();
  return newReview;
}

// Seller rating and loyalty functions
export function getSellerOverallRating(sellerId: string): { rating: number; totalReviews: number } {
  const sellerProducts = getProductsBySeller(sellerId);
  const allReviews: Review[] = [];
  
  sellerProducts.forEach(product => {
    if (product.reviews && product.reviews.length > 0) {
      allReviews.push(...product.reviews);
    }
  });

  if (allReviews.length === 0) {
    return { rating: 0, totalReviews: 0 };
  }

  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / allReviews.length;

  return {
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    totalReviews: allReviews.length,
  };
}

export function getSellerLoyaltyPoints(sellerId: string): number {
  const { rating, totalReviews } = getSellerOverallRating(sellerId);
  
  if (totalReviews === 0) {
    return 0;
  }

  // Base points from rating (0-50 points)
  const ratingPoints = rating * 10;
  
  // Bonus points for number of reviews (encourages more reviews)
  // 1 point per review, max 50 points
  const reviewBonus = Math.min(totalReviews, 50);
  
  // Perfect rating bonus (5.0 rating gets extra 20 points)
  const perfectRatingBonus = rating >= 5.0 ? 20 : 0;
  
  // High rating bonus (4.5+ gets 10 points)
  const highRatingBonus = rating >= 4.5 && rating < 5.0 ? 10 : 0;
  
  const totalPoints = Math.round(ratingPoints + reviewBonus + perfectRatingBonus + highRatingBonus);
  
  return totalPoints;
}

export function getSellerLoyaltyTier(points: number): { tier: string; color: string; icon: string } {
  if (points >= 100) {
    return { tier: 'Platinum', color: 'text-purple-400', icon: '💎' };
  } else if (points >= 75) {
    return { tier: 'Gold', color: 'text-yellow-400', icon: '⭐' };
  } else if (points >= 50) {
    return { tier: 'Silver', color: 'text-gray-300', icon: '🥈' };
  } else if (points >= 25) {
    return { tier: 'Bronze', color: 'text-orange-400', icon: '🥉' };
  } else if (points > 0) {
    return { tier: 'New', color: 'text-blue-400', icon: '🌱' };
  }
  return { tier: 'Unrated', color: 'text-muted-foreground', icon: '📊' };
}

export function getAllReviewsBySeller(sellerId: string): Array<Review & { productName: string; productId: string }> {
  const sellerProducts = getProductsBySeller(sellerId);
  const allReviews: Array<Review & { productName: string; productId: string }> = [];
  
  sellerProducts.forEach(product => {
    if (product.reviews && product.reviews.length > 0) {
      // Add product info to each review for context
      const reviewsWithProduct = product.reviews.map(review => ({
        ...review,
        productName: product.name,
        productId: product.id,
      }));
      allReviews.push(...reviewsWithProduct);
    }
  });

  // Sort by most recent first
  return allReviews.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Offer functions
export function createOffer(offer: Omit<Offer, 'id' | 'createdAt' | 'status' | 'productName' | 'negotiationHistory'>): Offer {
  const product = getProductById(offer.productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const newOffer: Offer = {
    ...offer,
    id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productName: product.name,
    status: 'pending',
    createdAt: new Date().toISOString(),
    negotiationHistory: [{
      price: offer.offerPrice,
      from: 'buyer',
      timestamp: new Date().toISOString(),
    }],
  };
  offersStore.push(newOffer);
  saveOffers();
  return newOffer;
}

export function createCounterOffer(
  offerId: string,
  counterPrice: number,
  from: 'buyer' | 'seller'
): Offer | null {
  const offer = offersStore.find(o => o.id === offerId);
  if (!offer) {
    return null;
  }

  // Add to negotiation history
  offer.negotiationHistory.push({
    price: counterPrice,
    from,
    timestamp: new Date().toISOString(),
  });

  // Update current counter offer
  offer.currentCounterOffer = {
    price: counterPrice,
    from,
    timestamp: new Date().toISOString(),
  };

  // Update offer price to the latest counter
  offer.offerPrice = counterPrice;
  offer.status = 'counter-offered';
  
  saveOffers();
  return offer;
}

export function getOffersBySeller(sellerId: string): Offer[] {
  return offersStore.filter(o => o.sellerId === sellerId);
}

export function getOffersByBuyer(buyerAddress: string): Offer[] {
  return offersStore.filter(o => o.buyerAddress === buyerAddress);
}

export function updateOfferStatus(offerId: string, status: 'approved' | 'rejected' | 'completed'): Offer | null {
  const offer = offersStore.find(o => o.id === offerId);
  if (offer) {
    offer.status = status;
    saveOffers();
    return offer;
  }
  return null;
}

export function getOfferById(offerId: string): Offer | undefined {
  return offersStore.find(o => o.id === offerId);
}

export function getOffersByProduct(productId: string): Offer[] {
  return offersStore.filter(o => o.productId === productId);
}

export function getLatestOfferForProduct(productId: string, buyerAddress: string): Offer | undefined {
  const productOffers = getOffersByProduct(productId);
  const buyerOffers = productOffers.filter(o => o.buyerAddress === buyerAddress);
  // Return the most recent offer
  return buyerOffers.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

export function getCompletedOffersBySeller(sellerId: string): Offer[] {
  return offersStore.filter(o => o.sellerId === sellerId && o.status === 'completed');
}

export function getProductSalesCount(productId: string): number {
  return offersStore.filter(o => o.productId === productId && o.status === 'completed').length;
}

export function getSoldProductsBySeller(sellerId: string): Array<{ productId: string; productName: string; salesCount: number; lastSaleDate: string }> {
  const completedOffers = getCompletedOffersBySeller(sellerId);
  const salesByProduct = new Map<string, { productName: string; salesCount: number; lastSaleDate: string }>();
  
  completedOffers.forEach(offer => {
    const existing = salesByProduct.get(offer.productId);
    if (existing) {
      existing.salesCount++;
      // Update last sale date if this offer is more recent
      if (new Date(offer.createdAt) > new Date(existing.lastSaleDate)) {
        existing.lastSaleDate = offer.createdAt;
      }
    } else {
      salesByProduct.set(offer.productId, {
        productName: offer.productName,
        salesCount: 1,
        lastSaleDate: offer.createdAt,
      });
    }
  });
  
  return Array.from(salesByProduct.entries()).map(([productId, data]) => ({
    productId,
    ...data,
  }));
}

export function getNewOffersCount(sellerId: string, lastChecked?: string): number {
  const sellerOffers = getOffersBySeller(sellerId);
  if (!lastChecked) {
    return sellerOffers.filter(o => o.status === 'pending' || o.status === 'counter-offered').length;
  }
  
  return sellerOffers.filter(o => {
    const isNew = new Date(o.createdAt) > new Date(lastChecked);
    const isActive = o.status === 'pending' || o.status === 'counter-offered';
    // Also check if there's a new counter-offer from buyer
    const hasNewCounterOffer = o.currentCounterOffer && 
      o.currentCounterOffer.from === 'buyer' &&
      new Date(o.currentCounterOffer.timestamp) > new Date(lastChecked);
    
    return (isNew && isActive) || hasNewCounterOffer;
  }).length;
}

