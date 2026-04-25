'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

const PLATFORM_DOMAINS: Record<string, string> = {
  kimi: 'KIMI.AI',
  deepseek: 'DEEPSEEK.COM',
  ernie: 'YIYAN.BAIDU.COM',
  qwen: 'TONGYI.ALIYUN.COM',
  doubao: 'DOUBAO.COM',
  zhipu: 'ZHIPUAI.CN',
};

function splitOriReading(text: string | null): { actionTitle: string; body: string } {
  if (!text) return { actionTitle: '', body: '' };
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length === 0) return { actionTitle: '', body: '' };
  if (paragraphs.length === 1) return { actionTitle: '', body: paragraphs[0] };
  return {
    actionTitle: paragraphs[0],
    body: paragraphs.slice(1).join('\n\n'),
  };
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
                totalSlides={totalSlides}
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
  totalSlides: number;
  panels: PanelsState;
  oriReading: string | null;
  status: string;
  onOpenQR: () => void;
  onScanAgain: () => void;
}

function SlideContent({ slide, idx, totalSlides, panels, oriReading, status, onOpenQR, onScanAgain }: SlideContentProps) {
  const currentDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, ' / ');

  if (slide.type === 'cover') {
    const footerSource = `OPENORI LITE SCAN · ${currentDate}`;

    return (
      <>
        <div className={styles.slideTopBar}>
          <span><span className={styles.topNum}>01</span> / 07</span>
          <span>{currentDate}</span>
        </div>

        <div className={styles.coverGrid}>
          <div className={styles.coverLeft}>
            <div>
              <div className={styles.coverLabel}>BRAND</div>
              <h1 className={styles.coverBrand}>{slide.brand}</h1>
            </div>
            <p className={styles.coverTagline}>
              今天我们看它在 6 家主流 AI 眼里是谁。
            </p>
          </div>
          <div className={styles.coverRight}>
            <div className={styles.coverQueryLabel}>QUERY</div>
            <p className={styles.coverQuery}>"{slide.question}"</p>
            <p className={styles.coverQueryMeta}>
              这道题 6 家 AI 都会答。<br/>
              答案里有没有提到{slide.brand},怎么提{slide.brand},<br/>
              就是品牌的 GEO 信号。
            </p>
          </div>
        </div>

        <div className={styles.pageSignature}>
          <div className={styles.signatureLine} />
          <div className={styles.signatureName}>
            <span className={styles.signatureOpen}>Open</span>
            <span className={styles.signatureOri}>Ori</span>
          </div>
        </div>

        <div className={styles.pageFooter}>
          <span>{footerSource}</span>
          <span>P. {String(idx + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}</span>
        </div>
      </>
    );
  }

  if (slide.type === 'platform') {
    const panel = panels[slide.platformId];
    const text = panel?.text || '';
    const panelStatus = panel?.status || 'waiting';
    const isLive = panelStatus === 'streaming';
    const isDone = panelStatus === 'done';
    const logoPath = slide.logo;

    const statusLabel = panelStatus === 'waiting' ? '等待中' : panelStatus === 'streaming' ? 'LIVE' : panelStatus === 'done' ? '已完成' : '出错';
    const platformDomain = PLATFORM_DOMAINS[slide.platformId] || '';
    const footerSource = `SOURCE: ${platformDomain} · API LAYER · ${currentDate}`;

    return (
      <>
        <div className={styles.slideTopBar}>
          <span>
            <span className={styles.topNum}>{String(idx + 1).padStart(2, '0')}</span> / 07
          </span>
          <span>{statusLabel}</span>
        </div>

        <div className={styles.aiHeader}>
          {logoPath && (
            <div className={styles.logoChip}>
              <img src={logoPath} alt={slide.brand} className={styles.logoImg} />
            </div>
          )}
          <div className={styles.headerCenter}>
            <div className={styles.eyebrow}>{slide.parent}</div>
            <div className={styles.brandName}>{slide.brand}</div>
          </div>
          <div className={styles.headerRight}>
            {panel?.latency != null && (
              <div className={styles.headerStat}>响应 {(panel.latency / 1000).toFixed(1)} 秒</div>
            )}
            {panel?.text && (
              <div>{panel.text.length} 字</div>
            )}
            {(panel?.latency == null && !panel?.text) && (
              <div>等待中</div>
            )}
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.readColumn}>
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

        <div className={styles.pageSignature}>
          <div className={styles.signatureLine} />
          <div className={styles.signatureName}>
            <span className={styles.signatureOpen}>Open</span>
            <span className={styles.signatureOri}>Ori</span>
          </div>
        </div>

        <div className={styles.pageFooter}>
          <span>{footerSource}</span>
          <span>P. {String(idx + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}</span>
        </div>
      </>
    );
  }

  if (slide.type === 'ori') {
    const { actionTitle: actionTitleFromOriReading, body: bodyTextFromOriReading } = splitOriReading(oriReading);
    const footerSource = `SOURCE: 6 AI MODELS · API LAYER · ${currentDate} · OPENORI LITE SCAN`;

    return (
      <>
        <div className={styles.slideTopBar}>
          <span><span className={styles.topNum}>07</span> / 07</span>
          <span style={{ color: '#C8A45E' }}>FINAL READ · BY ORI</span>
        </div>

        {oriReading ? (
          <>
            <div className={styles.oriActionTitle}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({children}) => <>{children}</>,
                  strong: ({children}) => <strong>{children}</strong>,
                  em: ({children}) => <em>{children}</em>,
                }}
              >
                {actionTitleFromOriReading}
              </ReactMarkdown>
            </div>
            <div className={styles.oriRule} />
            <div className={styles.oriBody}>
              <div className={styles.oriBodyText}>
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
                  {bodyTextFromOriReading}
                </ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.oriWaiting}>Ori 正在整理她的观察</div>
        )}

        <div className={styles.pageSignature}>
          <div className={styles.signatureLine} />
          <div className={styles.signatureName}>
            <span className={styles.signatureOpen}>Open</span>
            <span className={styles.signatureOri}>Ori</span>
          </div>
        </div>

        <div className={styles.pageFooter}>
          <span>{footerSource}</span>
          <span>P. {String(idx + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}</span>
        </div>
      </>
    );
  }

  if (slide.type === 'cta') {
    const footerSource = `OPENORI LITE SCAN · ${currentDate}`;

    return (
      <>
        <div className={styles.slideTopBar}>
          <span>
            <span className={styles.topNum}>{String(idx + 1).padStart(2, '0')}</span> / 07
          </span>
          <span>{currentDate}</span>
        </div>

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

        <div className={styles.pageSignature}>
          <div className={styles.signatureLine} />
          <div className={styles.signatureName}>
            <span className={styles.signatureOpen}>Open</span>
            <span className={styles.signatureOri}>Ori</span>
          </div>
        </div>

        <div className={styles.pageFooter}>
          <span>{footerSource}</span>
          <span>P. {String(idx + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}</span>
        </div>
      </>
    );
  }

  return null;
}
