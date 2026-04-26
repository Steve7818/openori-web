'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BrandLockup from '@/components/hero/BrandLockup';
import styles from './OriReadingExperience.module.css';
import { PLATFORM_SLIDES, SECTION_NAMES, type Slide } from './slides';
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
  initialPage?: number;
}

function getOriParagraphs(text: string | null): string[] {
  if (!text) return [];
  return text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
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
  initialPage = 1,
}: OriReadingExperienceProps) {
  const getInitialIdx = () => {
    if (process.env.NEXT_PUBLIC_LENS_DEBUG === '1' && initialPage) {
      const idx = initialPage - 1;
      if (idx >= 0 && idx <= 8) return idx;
    }
    return 0;
  };

  const initialIdx = getInitialIdx();
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [visitedSlides, setVisitedSlides] = useState<Set<number>>(new Set([initialIdx]));
  const [toastVisible, setToastVisible] = useState(false);

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

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <div className={styles.stage}>
      {/* Stage-level ambient logo — anchored, does NOT move with pages */}
      <div className={styles.ambientLayer} aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="100" cy="100" rx="76" ry="24" stroke="#f0ebe2" strokeWidth="0.6"/>
          <line x1="68" y1="22" x2="132" y2="178" stroke="#f0ebe2" strokeWidth="0.45"/>
          <ellipse cx="100" cy="100" rx="62" ry="19" stroke="#f0ebe2" strokeWidth="0.55" transform="rotate(-23.5 100 100)"/>
          <circle cx="100" cy="100" r="2.6" fill="#d97757"/>
        </svg>
      </div>

      {/* Page stage — slides horizontally */}
      <div className={styles.pageStage}>
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
                  totalSlides={totalSlides}
                  panels={panels}
                  oriReading={oriReading}
                  status={status}
                  brand={brand}
                  onOpenQR={onOpenQR}
                  onShareLink={handleShareLink}
                  onClose={onClose}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom navigation dots + arrows */}
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

      {/* Toast for copy link */}
      {toastVisible && (
        <div className={styles.toast}>已复制链接</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Slide content renderer
   ═══════════════════════════════════════════ */

interface SlideContentProps {
  slide: Slide;
  idx: number;
  totalSlides: number;
  panels: PanelsState;
  oriReading: string | null;
  status: string;
  brand: string;
  onOpenQR: () => void;
  onShareLink: () => void;
  onClose: () => void;
}

/** Uniform top bar: left=brand, center=section, right=date + close button */
function TopBar({ idx, totalSlides, onClose }: { idx: number; totalSlides: number; onClose: () => void }) {
  const sectionName = SECTION_NAMES[idx + 1] || '';
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric'
  }).replace(/\//g, ' / ');

  return (
    <div className={styles.topbar}>
      <BrandLockup />
      <span className={styles.topbarCenter}>{sectionName}</span>
      <div className={styles.topbarRight}>
        <span className={styles.topbarDate}>{currentDate}</span>
        <button
          className={styles.topbarClose}
          onClick={onClose}
          aria-label="关闭"
        >×</button>
      </div>
    </div>
  );
}

/** Uniform bottom bar: left=page#, right=brand stamp */
function BottomBar({ idx, totalSlides, brand }: { idx: number; totalSlides: number; brand: string }) {
  const pageNum = String(idx + 1).padStart(2, '0');
  const total = String(totalSlides).padStart(2, '0');
  const brandUpper = brand.toUpperCase();

  return (
    <div className={styles.bottombar}>
      <span className={styles.bottombarPage}>P. {pageNum} / {total}</span>
      <span>LITE SCAN · {brandUpper}</span>
    </div>
  );
}

function SlideContent({ slide, idx, totalSlides, panels, oriReading, status, brand, onOpenQR, onShareLink, onClose }: SlideContentProps) {
  /* ──── P.01 COVER ──── */
  if (slide.type === 'cover') {
    return (
      <>
        <TopBar idx={idx} totalSlides={totalSlides} onClose={onClose} />

        <div className={styles.content}>
          <div className={styles.coverGrid}>
            <div className={`${styles.coverCol} ${styles.coverColBrand}`}>
              <div className={styles.coverLabel}>BRAND</div>
              <h1 className={styles.coverTitle}>{slide.brand}</h1>
              <p className={styles.coverSub}>今天我们看它在 6 家主流 AI 眼里是谁。</p>
            </div>
            <div className={styles.coverDivider} />
            <div className={`${styles.coverCol} ${styles.coverColQuery}`}>
              <div className={styles.coverLabel}>QUERY</div>
              <p className={styles.coverQuote}>{slide.question}</p>
              <p className={styles.coverDesc}>
                这道题 6 家 AI 都会答。答案里有没有提到 <strong>{slide.brand}</strong>，怎么提 <strong>{slide.brand}</strong>，就是品牌的 GEO 信号。
              </p>
            </div>
          </div>
        </div>

        <BottomBar idx={idx} totalSlides={totalSlides} brand={slide.brand} />
      </>
    );
  }

  /* ──── P.02-07 PLATFORM ──── */
  if (slide.type === 'platform') {
    const panel = panels[slide.platformId];
    const text = panel?.text || '';

    return (
      <>
        <TopBar idx={idx} totalSlides={totalSlides} onClose={onClose} />

        <div className={styles.content}>
          <div className={styles.platformContent}>
            <div className={styles.platformHeader}>
              <div className={styles.platformLogo}>
                {slide.logo && (
                  <img src={slide.logo} alt={slide.brand} className={styles.platformLogoImg} />
                )}
              </div>
              <div className={styles.platformId}>
                <span className={styles.platformParent}>{slide.parent}</span>
                <span className={styles.platformName}>{slide.brand}</span>
              </div>
              <div className={styles.platformStats}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{panel?.text ? panel.text.length : '—'}</span>
                  <span className={styles.statLabel}>提及次数</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>—</span>
                  <span className={styles.statLabel}>偏离度</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{panel?.latency != null ? `${(panel.latency / 1000).toFixed(1)}s` : '—'}</span>
                  <span className={styles.statLabel}>响应延迟</span>
                </div>
                <div className={styles.stat}>
                  <span className={`${styles.statNum} ${styles.statSrc}`}>{slide.source}</span>
                  <span className={styles.statLabel}>数据来源</span>
                </div>
              </div>
            </div>

            <div className={styles.platformBody}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({children}) => <p>{children}</p>,
                  strong: ({children}) => <strong>{children}</strong>,
                  em: ({children}) => <em>{children}</em>,
                  ol: ({children}) => <>{children}</>,
                  ul: ({children}) => <>{children}</>,
                  li: ({children}) => <p>{children}</p>,
                  h1: ({children}) => <p><strong>{children}</strong></p>,
                  h2: ({children}) => <p><strong>{children}</strong></p>,
                  h3: ({children}) => <p><strong>{children}</strong></p>,
                  code: ({children}) => <code>{children}</code>,
                  pre: ({children}) => <>{children}</>,
                  a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        <BottomBar idx={idx} totalSlides={totalSlides} brand={brand} />
      </>
    );
  }

  /* ──── P.08 ORI FINALE ──── */
  if (slide.type === 'ori') {
    const paragraphs = getOriParagraphs(oriReading);

    return (
      <>
        <TopBar idx={idx} totalSlides={totalSlides} onClose={onClose} />

        <div className={styles.content}>
          {oriReading && paragraphs.length > 0 ? (
            <div className={styles.oriContent}>
              <div className={styles.oriMemoHead}>By Ori · GEO Analyst</div>

              <div className={styles.oriBody}>
                {paragraphs.map((para, i) => (
                  <p key={i} className={styles.oriBodyPara}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children}) => <>{children}</>,
                        strong: ({children}) => <strong>{children}</strong>,
                        em: ({children}) => <em>{children}</em>,
                      }}
                    >
                      {para}
                    </ReactMarkdown>
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.oriWaiting}>Ori 正在生成 Lite 全量报告</div>
          )}
        </div>

        <BottomBar idx={idx} totalSlides={totalSlides} brand={brand} />
      </>
    );
  }

  /* ──── P.09 CTA ──── */
  if (slide.type === 'cta') {
    return (
      <>
        <TopBar idx={idx} totalSlides={totalSlides} onClose={onClose} />

        <div className={styles.content}>
          <div className={styles.ctaGrid}>
            <div className={styles.ctaColText}>
              <div className={styles.ctaEyebrow}>由 Ori 呈现</div>

              <h2 className={styles.ctaTitle}>
                Lite 报告已完成。<br/>
                下一步 — Ori 调度全球顶尖 <span className={styles.em}>AI 架构</span>,<br/>
                和您进军本时代最大的品牌战场。
              </h2>

              <div className={styles.ctaDeliverableLabel}>— 全量报告会展开</div>

              <div className={styles.ctaBullets}>
                <div className={styles.ctaBullet}>
                  <span className={styles.ctaBulletMark} />
                  <span>双端 × 6 平台真实回答对照</span>
                </div>
                <div className={styles.ctaBullet}>
                  <span className={styles.ctaBulletMark} />
                  <span>行业 Top 5 对手品牌声量占比</span>
                </div>
                <div className={styles.ctaBullet}>
                  <span className={styles.ctaBulletMark} />
                  <span>海外 3 大平台(ChatGPT / Claude / Perplexity)同题对照</span>
                </div>
                <div className={styles.ctaBullet}>
                  <span className={styles.ctaBulletMark} />
                  <span>AI 偏离度根因 + 修复路径</span>
                </div>
              </div>
            </div>

            <div className={styles.ctaDivider} />

            <div className={styles.ctaColAction}>
              <div className={styles.qrBlock}>
                <Image
                  src="/wechat-qr.jpg"
                  alt="OpenOri 团队企业微信"
                  width={132}
                  height={132}
                  className={styles.qrImage}
                />
                <span className={styles.qrLabel}>
                  扫码添加 OpenOri 团队<br/>
                  让 AI 为您说话 <span className={styles.qrArrow}>→</span>
                </span>
              </div>

              <button className={styles.ctaSecondary} onClick={onShareLink}>
                分享本次 Ori 诊断报告
              </button>

              <div className={styles.ctaSignoff}>
                <span className={styles.ctaSignoffCn}>成为答案的答案</span>
                <span className={styles.ctaSignoffSep}>·</span>
                <span className={styles.ctaSignoffEn}>The answer behind the answers</span>
              </div>
            </div>
          </div>
        </div>

        <BottomBar idx={idx} totalSlides={totalSlides} brand={brand} />
      </>
    );
  }

  return null;
}
