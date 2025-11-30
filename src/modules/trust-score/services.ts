'use client';

import type { TrustScore } from './types';

const API_BASE = '/api';

export async function getTrustScore(userAddress: string): Promise<TrustScore> {
  try {
    const response = await fetch(`${API_BASE}/trust/${userAddress}`);
    if (!response.ok) {
      // Return default score if not found
      return {
        score: 0,
        level: 'new',
        successfulEscrows: 0,
        disputes: 0,
        completedNegotiations: 0,
        deliveryConfirmations: 0,
      };
    }
    return response.json();
  } catch {
    return {
      score: 0,
      level: 'new',
      successfulEscrows: 0,
      disputes: 0,
      completedNegotiations: 0,
      deliveryConfirmations: 0,
    };
  }
}

