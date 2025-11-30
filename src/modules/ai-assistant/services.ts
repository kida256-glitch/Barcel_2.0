'use client';

import type { AssistantRequest, AssistantResponse } from './types';

const API_BASE = '/api';

export async function sendAssistantMessage(
  request: AssistantRequest
): Promise<AssistantResponse> {
  const response = await fetch(`${API_BASE}/assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get assistant response');
  }

  return response.json();
}

