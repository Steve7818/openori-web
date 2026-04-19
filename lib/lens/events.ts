/**
 * Event tracking for lens funnel
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export function trackEvent(
  sessionId: string,
  eventType: string,
  metadata?: Record<string, any>
): void {
  // Fire and forget - don't await, don't block UI
  fetch(`${API_BASE}/api/chat/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      event_type: eventType,
      metadata,
    }),
  }).catch(() => {
    // Silent fail - tracking should never break UX
  });
}
