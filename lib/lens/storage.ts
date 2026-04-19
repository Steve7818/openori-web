/**
 * Session storage management for lens
 */

const SESSION_KEY = 'origeno_session_id';

export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function setSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, sessionId);
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}
