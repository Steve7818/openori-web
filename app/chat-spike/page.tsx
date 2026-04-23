'use client';

import { useState, useRef } from 'react';

export default function ChatSpike() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [platform, setPlatform] = useState('deepseek');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<{
    firstTokenMs?: number;
    totalMs?: number;
  }>({});
  const outputRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setOutput('');
    setMetrics({});
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        const err = await res.text();
        setOutput(`Error: ${err}`);
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.token) {
              fullText += data.token;
              setOutput(fullText);
            }
            if (data.first_token_ms) {
              setMetrics(prev => ({ ...prev, firstTokenMs: data.first_token_ms }));
            }
            if (data.done && data.total_ms) {
              setMetrics(prev => ({ ...prev, totalMs: data.total_ms }));
            }
          } catch {}
        }
      }
    } catch (err) {
      setOutput(`Fetch error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: 720, margin: '40px auto', padding: '0 24px',
      fontFamily: "'JetBrains Mono', monospace", color: '#F2E6D3', background: '#0A0A0A', minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: 18, color: '#D97757', marginBottom: 8 }}>
        AI Chat Spike — OpenOri
      </h1>
      <p style={{ fontSize: 12, color: '#8A8477', marginBottom: 24 }}>
        技术可行性验证 · 不对外开放
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <select
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          style={{
            background: '#141413', color: '#F2E6D3', border: '1px solid #2A2A28',
            padding: '8px 12px', fontSize: 13, borderRadius: 4
          }}
        >
          <option value="deepseek">DeepSeek</option>
        </select>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入问题..."
          style={{
            flex: 1, background: '#141413', color: '#F2E6D3', border: '1px solid #2A2A28',
            padding: '8px 12px', fontSize: 13, borderRadius: 4, outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#2A2A28' : '#D97757', color: '#0A0A0A',
            border: 'none', padding: '8px 20px', fontSize: 13, borderRadius: 4, cursor: loading ? 'wait' : 'pointer'
          }}
        >
          {loading ? '...' : '发送'}
        </button>
      </form>

      {(metrics.firstTokenMs !== undefined || metrics.totalMs !== undefined) && (
        <div style={{
          fontSize: 11, color: '#D97757', marginBottom: 16, padding: '8px 12px',
          background: 'rgba(217,119,87,0.08)', border: '1px solid rgba(217,119,87,0.2)', borderRadius: 4
        }}>
          {metrics.firstTokenMs !== undefined && <span>First token: {metrics.firstTokenMs}ms</span>}
          {metrics.totalMs !== undefined && <span style={{ marginLeft: 16 }}>Total: {metrics.totalMs}ms ({(metrics.totalMs / 1000).toFixed(1)}s)</span>}
        </div>
      )}

      <div
        ref={outputRef}
        style={{
          background: '#141413', border: '1px solid #2A2A28', borderRadius: 4,
          padding: 16, minHeight: 200, fontSize: 14, lineHeight: 1.7,
          color: '#F2E6D3', whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif"
        }}
      >
        {output || (loading ? '等待响应...' : '回答将显示在这里')}
      </div>
    </div>
  );
}
