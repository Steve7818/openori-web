'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './OriReadingExperience.module.css';
import { PLATFORM_SLIDES, type Slide } from './slides';
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
  onOpenQR: () => void;
  onScanAgain: () => void;
}

function SlideContent({ slide, idx, panels, oriReading, onOpenQR, onScanAgain }: SlideContentProps) {
  if (slide.type === 'cover') {
    return (
      <div className={styles.cover}>
        <div className={styles.coverMeta}>
          // ori · 初步扫描
        </div>
        <h1>
          读你的品牌,在 6 家 AI 里的样子
        </h1>
        <p className={styles.coverSub}>
          接下来 Ori 会用 6 家主流 AI 的真实回答,读一遍「{slide.brand}」在这个赛道里被看到的样子。一家一家读完,她会说几句。
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
        <div className={styles.pgTop}>
          <span>
            <span className={styles.pgIndex}>{pageNum}</span> / 07
          </span>
        </div>
        <div className={`${styles.streamStatus} ${isLive ? styles.streamStatusLive : ''}`}>
          {panelStatus === 'waiting' ? '等待回答' : panelStatus === 'streaming' ? 'live' : panelStatus === 'done' ? '已完成' : '出错'}
        </div>
        <h2 className={styles.pgBrand}>{slide.brand}</h2>
        <div className={styles.pgSub}>{slide.sub}</div>
        <div className={`${styles.pgBody} ${isDone ? styles.pgBodyDone : ''}`}>
          {text}
          {!isDone && <span className={styles.cursor} />}
        </div>
        <PlatformNote note={slide.oriNote} isDone={isDone} />
      </>
    );
  }

  if (slide.type === 'ori') {
    return <OriFinalSlide idx={idx} oriReading={oriReading} />;
  }

  if (slide.type === 'cta') {
    return (
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
    );
  }

  return null;
}

function PlatformNote({ note, isDone }: { note: string; isDone: boolean }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isDone) {
      const timer = setTimeout(() => setShown(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShown(false);
    }
  }, [isDone]);

  return (
    <div className={`${styles.pgNote} ${shown ? styles.shown : ''}`}>
      {note}
    </div>
  );
}

function OriFinalSlide({ idx, oriReading }: { idx: number; oriReading: string | null }) {
  const [shownParas, setShownParas] = useState(0);
  const [showDivider, setShowDivider] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const { mainBody, disclaimer } = useMemo(() => {
    if (!oriReading) return { mainBody: '', disclaimer: '' };
    const parts = oriReading.split(/\n\s*——\s*\n/);
    return {
      mainBody: parts[0] || oriReading,
      disclaimer: parts.length > 1 ? parts.slice(1).join('\n——\n') : '',
    };
  }, [oriReading]);

  const paragraphs = useMemo(() => mainBody.split('\n\n').filter((p) => p.trim()), [mainBody]);

  useEffect(() => {
    if (!oriReading) return;
    setShownParas(0);
    setShowDivider(false);
    setShowDisclaimer(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    paragraphs.forEach((_, i) => {
      timers.push(setTimeout(() => setShownParas((prev) => Math.max(prev, i + 1)), 200 + i * 380));
    });
    if (disclaimer) {
      timers.push(setTimeout(() => setShowDivider(true), 200 + paragraphs.length * 380 + 200));
      timers.push(setTimeout(() => setShowDisclaimer(true), 200 + paragraphs.length * 380 + 500));
    }
    return () => timers.forEach(clearTimeout);
  }, [oriReading, paragraphs.length, disclaimer]);

  if (!oriReading) {
    return (
      <div className={styles.oriFinal}>
        <div className={styles.oriSub}>
          // ori · 落笔中
        </div>
        <div className={styles.oriWaiting}>
          Ori 正在整理她的观察
        </div>
      </div>
    );
  }

  return (
    <div className={styles.oriFinal}>
      <div className={styles.oriSub}>
        // ori · 读完了,我说几件事
      </div>
      <div className={styles.oriFinalBody}>
        {paragraphs.map((para, i) => (
          <p key={i} className={i < shownParas ? styles.shown : ''}>
            {para}
          </p>
        ))}
      </div>
      {disclaimer && (
        <>
          <div className={`${styles.oriDivider} ${showDivider ? styles.shown : ''}`} />
          <div className={`${styles.oriDisclaimer} ${showDisclaimer ? styles.shown : ''}`}>
            {disclaimer}
          </div>
        </>
      )}
    </div>
  );
}
