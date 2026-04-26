'use client';

import { useEffect, useState } from 'react';
import { PanelsState } from './useLensStream';
import OriReadingExperience from './oriReading/OriReadingExperience';
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
  streamStatus: 'idle' | 'streaming' | 'done' | 'error';
  streamError: string | null;
  oriReading: string | null;
  initialPage?: number;
}

export default function LensModal({
  isOpen,
  onClose,
  brand,
  question,
  panels,
  sessionId,
  dailyRemaining,
  streamStatus,
  streamError,
  oriReading,
  initialPage = 1,
}: LensModalProps) {
  const [showWecomQR, setShowWecomQR] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCtaClick = () => {
    trackEvent(sessionId, 'cta_click', { target: 'wecom_qr' });
    setShowWecomQR(true);
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
        {streamError && (
          <div className={styles.errorBanner}>
            <div className={styles.errorIcon}>!</div>
            <div className={styles.errorBody}>
              <strong>
                {streamError.includes('今日扫描次数已用完') ? '今日扫描次数已用完' : '扫描失败'}
              </strong>
              <p>{streamError}</p>
            </div>
          </div>
        )}

        <OriReadingExperience
          panels={panels}
          oriReading={oriReading}
          status={streamStatus}
          brand={brand}
          question={question}
          dailyRemaining={dailyRemaining}
          onClose={onClose}
          onScanAgain={handleScanAgain}
          onOpenQR={() => setShowWecomQR(true)}
          initialPage={initialPage}
        />

        {/* 企微二维码弹窗 */}
        {showWecomQR && (
          <div className={styles.qrOverlay} onClick={() => setShowWecomQR(false)}>
            <div className={styles.qrModal} onClick={(e) => e.stopPropagation()}>
              <button className={styles.qrClose} onClick={() => setShowWecomQR(false)}>×</button>
              <h3 className={styles.qrTitle}>扫码添加 OpenOri 企业微信</h3>
              <img src="/qrcode-wecom.png" alt="OpenOri 企业微信二维码" className={styles.qrImage} />
              <p className={styles.qrHint}>使用微信扫一扫,Ori 的团队会在 24h 内联系你</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
