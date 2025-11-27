export interface Seller {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  successRate: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  sellerId: string;
  priceOptions: number[];
  productType?: 'premium' | 'other';
}
