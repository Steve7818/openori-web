/**
 * API client for lens endpoint
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export interface LensRequest {
  session_id: string;
  brand: string;
  question: string;
  turnstile_token?: string;
  t0: number;
}

export interface SessionInitResponse {
  session_id: string;
  daily_limit: number;
  daily_remaining: number;
}

export async function initSession(): Promise<SessionInitResponse> {
  const response = await fetch(`${API_BASE}/api/chat/session/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Session init failed: ${response.status}`);
  }

  return response.json();
}

export async function streamLens(request: LensRequest): Promise<Response> {
  const response = await fetch(`${API_BASE}/api/chat/lens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Lens request failed: ${response.status}`);
  }

  return response;
}
