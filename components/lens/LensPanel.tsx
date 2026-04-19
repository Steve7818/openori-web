'use client';

import { getPlatform } from './platforms';
import { PanelState } from './useLensStream';
import styles from './LensPanel.module.css';

interface LensPanelProps {
  platformId: string;
  state: PanelState;
  brand: string;
}

export default function LensPanel({ platformId, state, brand }: LensPanelProps) {
  const platform = getPlatform(platformId);
  if (!platform) return null;

  const { status, text, latency, devScore, devLabel, error } = state;

  // Latency class
  let latencyClass = '';
  if (latency !== null) {
    if (latency < 2000) latencyClass = styles.fast;
    else if (latency > 4000) latencyClass = styles.slow;
  }

  // Panel class
  let panelClass = styles.panel;
  if (status === 'streaming') panelClass += ` ${styles.streaming}`;
  if (status === 'done') panelClass += ` ${styles.done}`;

  // Highlight brand in text
  const highlightBrand = (content: string) => {
    if (!brand) return content;
    const regex = new RegExp(`(${brand})`, 'gi');
    const parts = content.split(regex);
    return parts.map((part, i) => {
      if (part.toLowerCase() === brand.toLowerCase()) {
        return <span key={i} className={styles.brandHighlight}>{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className={panelClass}>
      <div className={styles.header}>
        <div className={styles.nameGroup}>
          <div className={styles.logo} style={{ background: platform.logoBg }}>
            {platform.logo}
          </div>
          <div className={styles.name}>{platform.name}</div>
        </div>
        <div className={`${styles.latency} ${latencyClass}`}>
          {status === 'waiting' && '⏳ 查询中'}
          {status === 'streaming' && latency && `⚡ ${(latency / 1000).toFixed(1)}s`}
          {status === 'done' && latency && `⚡ ${(latency / 1000).toFixed(1)}s`}
          {status === 'error' && '❌ 错误'}
        </div>
      </div>

      <div className={styles.content}>
        {status === 'waiting' && (
          <div className={styles.skeleton}>
            <div className={`${styles.skeletonBar} ${styles.wFull}`}></div>
            <div className={`${styles.skeletonBar} ${styles.w90}`}></div>
            <div className={`${styles.skeletonBar} ${styles.w75}`}></div>
            <div className={`${styles.skeletonBar} ${styles.w60}`}></div>
          </div>
        )}

        {status === 'streaming' && (
          <>
            {highlightBrand(text)}
            <span className={styles.typingCursor}></span>
          </>
        )}

        {status === 'done' && (
          <>
            {highlightBrand(text)}
            {devScore && devLabel && (
              <div className={styles.deviationRow}>
                <span>AI 偏离度</span>
                <span className={`${styles.deviationScore} ${styles[devScore]}`}>
                  {devLabel}
                </span>
              </div>
            )}
          </>
        )}

        {status === 'error' && (
          <div style={{ color: 'var(--danger)', fontSize: '12px' }}>
            {error || '查询失败'}
          </div>
        )}
      </div>
    </div>
  );
}
