'use client';

import type { EscrowRequest, EscrowResponse, EscrowStatus } from './types';

const API_BASE = '/api';

export async function createEscrow(request: EscrowRequest): Promise<EscrowResponse> {
  const response = await fetch(`${API_BASE}/escrow/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create escrow');
  }

  return response.json();
}

export async function releaseEscrow(escrowId: string, buyerAddress: string): Promise<EscrowResponse> {
  const response = await fetch(`${API_BASE}/escrow/release`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ escrowId, buyerAddress }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to release escrow');
  }

  return response.json();
}

export async function cancelEscrow(escrowId: string, buyerAddress: string): Promise<EscrowResponse> {
  const response = await fetch(`${API_BASE}/escrow/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ escrowId, buyerAddress }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel escrow');
  }

  return response.json();
}

export async function getEscrowStatus(escrowId: string): Promise<EscrowStatus | null> {
  try {
    const response = await fetch(`${API_BASE}/escrow/${escrowId}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

