'use client';

import type { NegotiationRequest, NegotiationResponse } from './types';

const API_BASE = '/api';

export async function startNegotiation(
  request: NegotiationRequest
): Promise<NegotiationResponse> {
  const response = await fetch(`${API_BASE}/negotiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to start negotiation');
  }

  return response.json();
}

export async function getNegotiationHistory(negotiationId: string): Promise<NegotiationResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/negotiate/${negotiationId}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

