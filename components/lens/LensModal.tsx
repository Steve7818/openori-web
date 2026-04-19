'use client';

import { useEffect } from 'react';
import { PLATFORMS } from './platforms';
import { PanelsState } from './useLensStream';
import LensPanel from './LensPanel';
import { trackEvent } from '@/lib/lens/events';
import styles from './LensModal.module.css';

interface LensModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: string;
  question: string;
  panels: PanelsState;
  sessionId: string;
  dailyRemaining: number;
}

export default function LensModal({
  isOpen,
  onClose,
  brand,
  question,
  panels,
  sessionId,
  dailyRemaining,
}: LensModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCtaClick = () => {
    trackEvent(sessionId, 'cta_click', { target: '/' });
    window.location.href = '/';
  };

  const handleScanAgain = () => {
    if (dailyRemaining > 0) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.backdrop} ${isOpen ? styles.active : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>

        <div className={styles.header}>
          <div className={styles.eyebrow}>// AI 偏离度扫描报告 · 6 大平台</div>
          <h2 className={styles.question}>
            <span>{question}</span>
            {' · '}
            <span className={styles.questionBrand}>{brand}</span>
          </h2>
        </div>

        <div className={styles.grid}>
          {PLATFORMS.map(p => (
            <LensPanel
              key={p.id}
              platformId={p.id}
              state={panels[p.id] || { status: 'waiting', text: '', latency: null, devScore: null, devLabel: null, error: null }}
              brand={brand}
            />
          ))}
        </div>

        <div className={styles.cta}>
          <h3 className={styles.ctaH3}>
            你的 <em>AI 偏离度</em>评分已生成
          </h3>
          <p className={styles.ctaP}>
            AI 时代, 品牌不在答案里 = 品牌不存在。让 Origeno 把你的偏离度降下来。
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaPrimary} onClick={handleCtaClick}>
              立即免费 GEO 诊断 →
            </button>
            <button
              className={styles.ctaSecondary}
              onClick={handleScanAgain}
              disabled={dailyRemaining === 0}
            >
              再扫一次(剩 {dailyRemaining}/2)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
