'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './OriReadingExperience.module.css';
import { PLATFORM_SLIDES, ORI_SLIDE_META, type Slide } from './slides';
import type { PanelsState } from '../useLensStream';

interface OriReadingExperienceProps {
  panels: PanelsState;
  oriReading: string | null;
  status: 'idle' | 'streaming' | 'done' | 'error';
  brand: string;
  question: string;
  dailyRemaining: number;
  onClose: () => void;
  onScanAgain: () => void;
  onOpenQR: () => void;
}

export default function OriReadingExperience({
  panels,
  oriReading,
  status,
  brand,
  question,
  dailyRemaining,
  onClose,
  onScanAgain,
  onOpenQR,
}: OriReadingExperienceProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visitedSlides, setVisitedSlides] = useState<Set<number>>(new Set([0]));

  const slides: Slide[] = useMemo(
    () => [
      { type: 'cover', brand, question },
      ...PLATFORM_SLIDES.map((p) => ({ type: 'platform' as const, ...p })),
      { type: 'ori' },
      { type: 'cta', dailyRemaining },
    ],
    [brand, question, dailyRemaining]
  );

  const totalSlides = slides.length;

  const goTo = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= totalSlides) return;
    if (newIdx === currentIdx) return;
    setCurrentIdx(newIdx);
    setVisitedSlides((prev) => new Set(prev).add(newIdx));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(currentIdx + 1);
      if (e.key === 'ArrowLeft') goTo(currentIdx - 1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIdx, onClose]);

  return (
    <div className={styles.container}>
      <div
        className={styles.slidesTrack}
        style={{ transform: `translateX(-${currentIdx * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className={styles.slideWrapper}>
            <div className={styles.page}>
              <SlideContent
                slide={slide}
                idx={i}
                panels={panels}
                oriReading={oriReading}
                status={status}
                onOpenQR={onOpenQR}
                onScanAgain={onScanAgain}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.navBar}>
        <div className={styles.dots}>
          {slides.map((_, i) => {
            const isActive = i === currentIdx;
            const isVisited = visitedSlides.has(i);
            return (
              <button
                key={i}
                className={`${styles.dot} ${isActive ? styles.dotActive : ''} ${isVisited ? styles.dotVisited : ''}`}
                onClick={() => goTo(i)}
                aria-label={`slide ${i + 1}`}
              />
            );
          })}
        </div>
        <div className={styles.arrows}>
          <button
            className={`${styles.arrow} ${currentIdx === 0 ? styles.arrowDisabled : ''}`}
            onClick={() => goTo(currentIdx - 1)}
            aria-label="previous"
          >
            ←
          </button>
          <button
            className={`${styles.arrow} ${currentIdx === totalSlides - 1 ? styles.arrowDisabled : ''}`}
            onClick={() => goTo(currentIdx + 1)}
            aria-label="next"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

interface SlideContentProps {
  slide: Slide;
  idx: number;
  panels: PanelsState;
  oriReading: string | null;
  status: string;
  onOpenQR: () => void;
  onScanAgain: () => void;
}

function SlideContent({ slide, idx, panels, oriReading, status, onOpenQR, onScanAgain }: SlideContentProps) {
  if (slide.type === 'cover') {
    return (
      <div className={styles.pageInner}>
        <div className={styles.cover}>
          <div className={styles.coverMeta}>
            // ori · 初步扫描
          </div>
          <h1>
            读一遍你的品牌,在 6 家 AI 里的样子
          </h1>
          <p className={styles.coverSub}>
            用 6 家主流 AI 的真实回答,看一次「{slide.brand}」在 AI 眼里的认知。读完 6 家,OpenOri 在最后说几句。
          </p>
          <div className={styles.coverMeta}>
            品牌<span className={styles.coverMetaVal}>{slide.brand}</span>
          </div>
          <div className={styles.coverMeta}>
            问题<span className={styles.coverMetaVal}>{slide.question}</span>
          </div>
          <div className={styles.coverHint}>
            按 <span className={styles.kbd}>→</span> 开始
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === 'platform') {
    const panel = panels[slide.platformId];
    const text = panel?.text || '';
    const panelStatus = panel?.status || 'waiting';
    const isLive = panelStatus === 'streaming';
    const isDone = panelStatus === 'done';
    const pageNum = String(idx).padStart(2, '0');

    return (
      <>
        <div className={styles.pgTopBar}>
          <span className={styles.pgIndex}>{pageNum} / 07</span>
          <span className={`${styles.streamStatus} ${isLive ? styles.streamStatusLive : ''}`}>
            {panelStatus === 'waiting' ? '等待回答' : panelStatus === 'streaming' ? 'live' : panelStatus === 'done' ? '已完成' : '出错'}
          </span>
        </div>
        <div className={styles.pageInner}>
          <div className={styles.pgBrandRow}>
            {slide.logo && (
              <div className={styles.pgLogoChip}>
                <img src={slide.logo} alt={slide.brand} className={styles.pgLogo} />
              </div>
            )}
            <h2 className={styles.pgBrand}>{slide.brand}</h2>
          </div>
          <div className={styles.pgParent}>{slide.parent}</div>
          <div className={styles.pgSub}>
            {panel?.latency != null && (
              <>响应 {(panel.latency / 1000).toFixed(1)} 秒</>
            )}
            {panel?.text && (
              <> · {panel.text.length} 字</>
            )}
            {(panel?.latency == null && !panel?.text) && '等待中'}
          </div>
          <div className={`${styles.pgBody} ${isDone ? styles.pgBodyDone : ''}`}>
            {text}
            {!isDone && <span className={styles.cursor} />}
          </div>
        </div>
      </>
    );
  }

  if (slide.type === 'ori') {
    const text = oriReading || '';
    const isDone = status === 'done';

    return (
      <>
        <div className={styles.pgTopBar}>
          <span className={styles.pgIndex}>07 / 07</span>
          <span className={`${styles.streamStatus} ${!isDone ? styles.streamStatusLive : ''}`}>
            {isDone ? '已完成' : 'live'}
          </span>
        </div>
        <div className={styles.pageInner}>
          <div className={styles.pgBrandRow}>
            <div className={styles.pgLogoChip} style={{ background: 'rgba(200, 164, 94, 0.12)' }}>
              <span style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '18px', fontStyle: 'italic', color: '#C8A45E', fontWeight: 400 }}>O</span>
            </div>
            <h2 className={styles.pgBrand} style={{ color: '#C8A45E', fontStyle: 'italic' }}>OpenOri</h2>
          </div>
          <div className={styles.pgParent}>第 7 家 · Ori 的判断</div>
          <div className={styles.pgSub}>
            {text ? `${text.length} 字` : '等待中'}
          </div>
          <div className={`${styles.pgBody} ${isDone ? styles.pgBodyDone : ''}`}>
            {text || 'Ori 正在整理观察...'}
            {!isDone && text && <span className={styles.cursor} />}
          </div>
        </div>
      </>
    );
  }

  if (slide.type === 'cta') {
    return (
      <div className={styles.pageInner}>
        <div className={styles.cta}>
          <div className={styles.coverMeta}>
            // 想继续跟 ori 聊?
          </div>
          <h2>
            下一步,Ori 给你看真实的 C 端
          </h2>
          <p className={styles.ctaDesc}>
            这次是 API 层的快照。用户在手机上刷到的答案,以及 Ori 基于全量数据的诊断,都在下一步。加企微,让 Ori 给你一份完整的品牌 AI 体检报告。
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaPrimary} onClick={onOpenQR}>
              扫码加企业微信 →
            </button>
            <button className={styles.ctaSecondary} onClick={onScanAgain} disabled={slide.dailyRemaining === 0}>
              再扫一次(剩 {slide.dailyRemaining}/2)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
