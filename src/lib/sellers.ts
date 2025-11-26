'use client';

import type { Seller } from './types';

// In-memory seller store with localStorage persistence
let sellersStore: Seller[] = [];

const SELLERS_STORAGE_KEY = 'celobargain_sellers';

// Initialize sellers from localStorage
export function initializeSellers() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(SELLERS_STORAGE_KEY);
      if (stored) {
        sellersStore = JSON.parse(stored);
      } else {
        sellersStore = [];
      }
    } catch (error) {
      console.error('Error loading sellers:', error);
      sellersStore = [];
    }
  }
}

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  initializeSellers();
}

function saveSellers() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SELLERS_STORAGE_KEY, JSON.stringify(sellersStore));
    } catch (error) {
      console.error('Error saving sellers:', error);
    }
  }
}

/**
 * Get seller by ID, or create a default one if not found
 */
export function getSellerById(sellerId: string): Seller {
  let seller = sellersStore.find(s => s.id === sellerId);
  
  if (!seller) {
    // Create a default seller profile
    seller = {
      id: sellerId,
      name: `Seller ${sellerId.slice(0, 6)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sellerId}`,
      bio: 'Active seller on Barcel',
      rating: 5.0,
      successRate: 100,
    };
    sellersStore.push(seller);
    saveSellers();
  }
  
  return seller;
}

/**
 * Update seller information
 */
export function updateSeller(sellerId: string, updates: Partial<Seller>): Seller | null {
  let seller = sellersStore.find(s => s.id === sellerId);
  
  if (!seller) {
    // Create new seller
    seller = {
      id: sellerId,
      name: updates.name || `Seller ${sellerId.slice(0, 6)}`,
      avatar: updates.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sellerId}`,
      bio: updates.bio || 'Active seller on CeloBargain',
      rating: updates.rating || 5.0,
      successRate: updates.successRate || 100,
    };
    sellersStore.push(seller);
  } else {
    seller = { ...seller, ...updates };
    const index = sellersStore.findIndex(s => s.id === sellerId);
    sellersStore[index] = seller;
  }
  
  saveSellers();
  return seller;
}

/**
 * Get all sellers
 */
export function getAllSellers(): Seller[] {
  return sellersStore;
}

