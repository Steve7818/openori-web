'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

function splitOriReading(text: string | null): { actionTitle: string; summary: string; bullets: string[] } {
  if (!text) return { actionTitle: '', summary: '', bullets: [] };
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length === 0) return { actionTitle: '', summary: '', bullets: [] };

  // First paragraph = action title
  const actionTitle = (paragraphs[0] || '').slice(0, 30);

  // Second paragraph = summary
  const summary = (paragraphs[1] || '').slice(0, 80);

  // Remaining paragraphs = bullets (max 3, each ≤50 chars)
  const bullets = paragraphs.slice(2, 5).map(b => {
    // Strip leading bullet markers like "- ", "• ", "* "
    const cleaned = b.replace(/^[-•*]\s*/, '');
    return cleaned.slice(0, 50);
  });

  return { actionTitle, summary, bullets };
}

/** Mini brand mark SVG used in top/bottom bars */
function MiniMark() {
  return (
    <svg className={styles.miniMark} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="100" rx="76" ry="24" stroke="#f0ebe2" strokeWidth="6.5"/>
      <line x1="68" y1="22" x2="132" y2="178" stroke="#f0ebe2" strokeWidth="3"/>
      <ellipse cx="100" cy="100" rx="62" ry="19" stroke="#f0ebe2" strokeWidth="4" strokeOpacity="0.88" transform="rotate(-23.5 100 100)"/>
      <circle cx="100" cy="100" r="9" fill="#d97757"/>
    </svg>
  );
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
            \u2190
          </button>
          <button
            className={`${styles.arrow} ${currentIdx === totalSlides - 1 ? styles.arrowDisabled : ''}`}
            onClick={() => goTo(currentIdx + 1)}
            aria-label="next"
          >
            \u2192
          </button>
        </div>
      </div>

      {/* Toast for copy link */}
      {toastVisible && (
        <div className={styles.toast}>\u5df2\u590d\u5236\u94fe\u63a5</div>
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
}

/** Uniform top bar: left=page#, center=section, right=date */
function TopBar({ idx, totalSlides }: { idx: number; totalSlides: number }) {
  const pageNum = String(idx + 1).padStart(2, '0');
  const total = String(totalSlides).padStart(2, '0');
  const sectionName = SECTION_NAMES[idx + 1] || '';
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric'
  }).replace(/\//g, ' / ');

  return (
    <div className={styles.topbar}>
      <div className={styles.brandStamp}>
        <MiniMark />
        <span className={styles.brandStampName}>
          Open<span className={styles.oriEm}>Ori</span>
        </span>
      </div>
      <span className={styles.topbarCenter}>{sectionName}</span>
      <span>{currentDate}</span>
    </div>
  );
}

/** Uniform bottom bar: left=brand stamp text, center=deck id, right=date+page */
function BottomBar({ idx, totalSlides, brand }: { idx: number; totalSlides: number; brand: string }) {
  const pageNum = String(idx + 1).padStart(2, '0');
  const total = String(totalSlides).padStart(2, '0');
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric'
  }).replace(/\//g, ' / ');
  const brandUpper = brand.toUpperCase();

  return (
    <div className={styles.bottombar}>
      <span>LITE SCAN \u00b7 {brandUpper}</span>
      <span>P. {pageNum} / {total}</span>
    </div>
  );
}

function SlideContent({ slide, idx, totalSlides, panels, oriReading, status, brand, onOpenQR, onShareLink }: SlideContentProps) {
  /* ──── P.01 COVER ──── */
  if (slide.type === 'cover') {
    return (
      <>
        <TopBar idx={idx} totalSlides={totalSlides} />

        <div className={styles.content}>
          <div className={styles.coverGrid}>
            <div className={`${styles.coverCol} ${styles.coverColBrand}`}>
              <div className={styles.coverLabel}>BRAND</div>
              <h1 className={styles.coverTitle}>{slide.brand}</h1>
              <p className={styles.coverSub}>\u4eca\u5929\u6211\u4eec\u770b\u5b83\u5728 6 \u5bb6\u4e3b\u6d41 AI \u773c\u91cc\u662f\u8c01\u3002</p>
            </div>
            <div className={styles.coverDivider} />
            <div className={`${styles.coverCol} ${styles.coverColQuery}`}>
              <div className={styles.coverLabel}>QUERY</div>
              <p className={styles.coverQuote}>{slide.question}</p>
              <p className={styles.coverDesc}>
                \u8fd9\u9053\u9898 6 \u5bb6 AI \u90fd\u4f1a\u7b54\u3002\u7b54\u6848\u91cc\u6709\u6ca1\u6709\u63d0\u5230 <strong>{slide.brand}</strong>\uff0c\u600e\u4e48\u63d0 <strong>{slide.brand}</strong>\uff0c\u5c31\u662f\u54c1\u724c\u7684 GEO \u4fe1\u53f7\u3002
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
        <TopBar idx={idx} totalSlides={totalSlides} />

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
                {panel?.text && (
                  <div className={styles.stat}>
                    <span className={styles.statNum}>{panel.text.length}</span>
                    <span className={styles.statLabel}>MENTIONS</span>
                  </div>
                )}
                <div className={styles.stat}>
                  <span className={styles.statNum}>—</span>
                  <span className={styles.statLabel}>DEVIATION</span>
                </div>
                {panel?.latency != null && (
                  <div className={styles.stat}>
                    <span className={styles.statNum}>{(panel.latency / 1000).toFixed(1)}s</span>
                    <span className={styles.statLabel}>LATENCY</span>
                  </div>
                )}
                <div className={styles.stat}>
                  <span className={`${styles.statNum} ${styles.statSrc}`}>{slide.source}</span>
                  <span className={styles.statLabel}>SOURCE</span>
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
    const { actionTitle, summary, bullets } = splitOriReading(oriReading);

    return (
      <>
        <TopBar idx={idx} totalSlides={totalSlides} />

        <div className={styles.content}>
          {oriReading ? (
            <div className={styles.oriContent}>
              <div className={styles.oriEyebrow}>Ori \u7ed9\u4f60\u7684 read</div>

              <h2 className={styles.oriActionTitle}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({children}) => <>{children}</>,
                    strong: ({children}) => <span className={styles.em}>{children}</span>,
                    em: ({children}) => <span className={styles.em}>{children}</span>,
                  }}
                >
                  {actionTitle}
                </ReactMarkdown>
              </h2>

              <div className={styles.oriRule} />

              <p className={styles.oriSummary}>{summary}</p>

              <div className={styles.oriEvidence}>
                {bullets.map((bullet, i) => (
                  <div key={i} className={styles.oriEvidenceItem}>
                    <span className={styles.oriEvidenceBullet} />
                    <span className={styles.oriEvidenceText}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({children}) => <>{children}</>,
                          strong: ({children}) => <strong>{children}</strong>,
                          em: ({children}) => <em>{children}</em>,
                        }}
                      >
                        {bullet}
                      </ReactMarkdown>
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.oriSignoff}>
                <span className={styles.oriSignoffCn}>\u6210\u4e3a\u7b54\u6848\u7684\u7b54\u6848</span>
                <span className={styles.oriSignoffSep}>\u00b7</span>
                <span className={styles.oriSignoffEn}>The answer behind the answers</span>
              </div>
            </div>
          ) : (
            <div className={styles.oriWaiting}>Ori \u6b63\u5728\u6574\u7406\u5979\u7684\u89c2\u5bdf</div>
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
        <TopBar idx={idx} totalSlides={totalSlides} />

        <div className={styles.content}>
          <div className={styles.ctaGrid}>
            <div className={styles.ctaColText}>
              <div className={styles.ctaEyebrow}>\u7531 Ori \u5448\u73b0</div>

              <h2 className={styles.ctaTitle}>
                Lite \u62a5\u544a\u5df2\u5b8c\u6210\u3002<br/>
                \u4e0b\u4e00\u6b65 \u2014 Ori \u8c03\u5ea6\u5168\u7403\u9876\u5c16 <span className={styles.em}>AI \u67b6\u6784</span>\uff0c<br/>
                \u548c\u60a8\u8fdb\u519b\u672c\u65f6\u4ee3\u6700\u5927\u7684\u54c1\u724c\u6218\u573a\u3002
              </h2>

              <p className={styles.ctaBody}>
                \u60a8\u521a\u770b\u5230\u7684 Lite Scan\uff0cOri \u76f4\u63a5\u8c03\u4e86 6 \u5927\u5e73\u53f0\u7684 API\u3002\u4f46 AI \u5728 APP \u548c Web \u4e0a\u5448\u73b0\u7684\u7248\u672c\u4e0d\u4e00\u6837\uff0c\u7528\u6237\u5728 ChatGPT App \u770b\u5230\u7684\u3001\u8c46\u5305 Web \u770b\u5230\u7684\u3001\u5c0f\u7ea2\u4e66 AI \u770b\u5230\u7684\uff0c\u5dee\u5f02\u5de8\u5927\u3002
              </p>

              <div className={styles.ctaDeliverableLabel}>\u2014 \u5168\u91cf\u62a5\u544a\u4f1a\u5c55\u5f00</div>

              <div className={styles.ctaBullets}>
                <div className={styles.ctaBullet}>
                  <span className={styles.ctaBulletMark} />
                  <span>\u53cc\u7aef \u00d7 6 \u5e73\u53f0\u771f\u5b9e\u56de\u7b54\u5bf9\u7167</span>
                </div>
                <div className={styles.ctaBullet}>
                  <span className={styles.ctaBulletMark} />
                  <span>\u884c\u4e1a Top 5 \u5bf9\u624b\u54c1\u724c\u58f0\u91cf\u5360\u6bd4</span>
                </div>
                <div className={styles.ctaBullet}>
                  <span className={styles.ctaBulletMark} />
                  <span>\u6d77\u5916 3 \u5927\u5e73\u53f0\uff08ChatGPT / Claude / Perplexity\uff09\u540c\u9898\u5bf9\u7167</span>
                </div>
                <div className={styles.ctaBullet}>
                  <span className={styles.ctaBulletMark} />
                  <span>AI \u504f\u79bb\u5ea6\u6839\u56e0 + \u4fee\u590d\u8def\u5f84</span>
                </div>
              </div>
            </div>

            <div className={styles.ctaDivider} />

            <div className={styles.ctaColAction}>
              <div className={styles.qrBlock}>
                <div className={styles.qrPlaceholder}>QR</div>
                <span className={styles.qrLabel}>
                  \u626b\u7801\u6dfb\u52a0 OpenOri \u56e2\u961f<br/>
                  \u8ba9 AI \u4e3a\u60a8\u8bf4\u8bdd <span className={styles.qrArrow}>\u2192</span>
                </span>
              </div>

              <button className={styles.ctaSecondary} onClick={onShareLink}>
                \u5206\u4eab\u672c\u6b21 Ori \u8bca\u65ad\u62a5\u544a
              </button>

              <div className={styles.ctaSignoff}>
                <span className={styles.ctaSignoffCn}>\u6210\u4e3a\u7b54\u6848\u7684\u7b54\u6848</span>
                <span className={styles.ctaSignoffSep}>\u00b7</span>
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
