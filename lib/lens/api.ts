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
  mode: 'chat' | 'lens';
}

export async function initLensSession(): Promise<SessionInitResponse> {
  const response = await fetch(`${API_BASE}/api/chat/lens/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Lens session init failed: ${response.status}`);
  }

  return response.json();
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

export async function streamLens(request: LensRequest, signal?: AbortSignal): Promise<Response> {
  const response = await fetch(`${API_BASE}/api/chat/lens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));

    // Handle 429 rate limit with friendly message
    if (response.status === 429) {
      const message = error.cta
        ? `今日扫描次数已用完。${error.cta}`
        : '今日扫描次数已用完，明天再来吧！或试试免费 GEO 诊断 →';
      throw new Error(message);
    }

    throw new Error(error.error || `请求失败 (${response.status})`);
  }

  return response;
}
