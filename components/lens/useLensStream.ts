/**
 * useLensStream hook - manages 6-platform concurrent streaming
 */

import { useState, useCallback } from 'react';
import { streamLens } from '@/lib/lens/api';
import { trackEvent } from '@/lib/lens/events';
import { PLATFORMS } from './platforms';

export interface PanelState {
  status: 'waiting' | 'streaming' | 'done' | 'error';
  text: string;
  latency: number | null;
  devScore: string | null;
  devLabel: string | null;
  error: string | null;
}

export type PanelsState = Record<string, PanelState>;

export interface UseLensStreamResult {
  panels: PanelsState;
  status: 'idle' | 'streaming' | 'done' | 'error';
  error: string | null;
  start: (sessionId: string, brand: string, question: string) => Promise<void>;
}

export function useLensStream(): UseLensStreamResult {
  const [panels, setPanels] = useState<PanelsState>({});
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (sessionId: string, brand: string, question: string) => {
    setStatus('streaming');
    setError(null);

    // Initialize panels (6 skeleton states)
    const initialPanels: PanelsState = {};
    PLATFORMS.forEach(p => {
      initialPanels[p.id] = {
        status: 'waiting',
        text: '',
        latency: null,
        devScore: null,
        devLabel: null,
        error: null,
      };
    });
    setPanels(initialPanels);

    // Track lens_submit
    trackEvent(sessionId, 'lens_submit', { brand, question });

    try {
      const t0 = Date.now();
      const response = await streamLens({
        session_id: sessionId,
        brand,
        question,
        t0,
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstTokenReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const event = JSON.parse(line.substring(6));
            handleEvent(event, sessionId, setPanels, setStatus, () => {
              if (!firstTokenReceived) {
                firstTokenReceived = true;
                trackEvent(sessionId, 'lens_first_token');
              }
            });
          } catch (e) {
            console.error('Failed to parse SSE event:', e);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Stream failed');
      setStatus('error');
    }
  }, []);

  return { panels, status, error, start };
}

function handleEvent(
  event: any,
  sessionId: string,
  setPanels: React.Dispatch<React.SetStateAction<PanelsState>>,
  setStatus: React.Dispatch<React.SetStateAction<'idle' | 'streaming' | 'done' | 'error'>>,
  onFirstToken: () => void
) {
  const { type } = event;

  if (type === 'token') {
    const { platform, token, t_first } = event;
    setPanels(prev => {
      const panel = prev[platform];
      if (!panel) return prev;

      const isFirstToken = panel.status === 'waiting';
      if (isFirstToken) {
        onFirstToken();
      }

      return {
        ...prev,
        [platform]: {
          ...panel,
          status: 'streaming',
          text: panel.text + token,
          latency: t_first !== undefined ? t_first * 1000 : panel.latency,
        },
      };
    });
  } else if (type === 'platform_done') {
    const { platform, deviation_score, deviation_label, latency_ms } = event;
    setPanels(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        status: 'done',
        devScore: deviation_score,
        devLabel: deviation_label,
        latency: latency_ms,
      },
    }));
  } else if (type === 'all_done') {
    setStatus('done');
    trackEvent(sessionId, 'lens_complete', {
      batch_id: event.batch_id,
      total_cost: event.total_cost_rmb,
    });
  } else if (type === 'error') {
    const { platform, error: errorMsg } = event;
    setPanels(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        status: 'error',
        error: errorMsg,
      },
    }));
  }
}
