'use client';

import { useState, useEffect, FormEvent, KeyboardEvent } from 'react';
import { PLATFORMS } from './platforms';
import { getSessionId } from '@/lib/lens/storage';
import { trackEvent } from '@/lib/lens/events';
import styles from './LensCard.module.css';

interface LensCardProps {
  onLaunch: (brand: string, question: string) => void;
  dailyRemaining: number;
  isLoading?: boolean;
}

export default function LensCard({ onLaunch, dailyRemaining, isLoading = false }: LensCardProps) {
  const [brand, setBrand] = useState('');
  const [question, setQuestion] = useState('');
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(dailyRemaining);

  useEffect(() => {
    setRemaining(dailyRemaining);
  }, [dailyRemaining]);

  useEffect(() => {
    // Session init is now handled by HeroSection.
    // Just read from storage once available (poll briefly).
    const existingSession = getSessionId();
    if (existingSession) {
      setSessionIdState(existingSession);
      trackEvent(existingSession, 'lens_open');
      return;
    }

    // Poll sessionStorage for up to 3s (HeroSection is initializing)
    let attempts = 0;
    const interval = setInterval(() => {
      const sid = getSessionId();
      if (sid) {
        clearInterval(interval);
        setSessionIdState(sid);
        trackEvent(sid, 'lens_open');
      }
      if (++attempts >= 30) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !question.trim()) {
      // TODO: Add shake animation
      return;
    }

    // Check quota before launching
    if (remaining <= 0) {
      alert('今日扫描次数已用完，明天再来吧！或者试试我们的免费 GEO 诊断 →');
      return;
    }

    onLaunch(brand.trim(), question.trim());
  };

  const handleBrandKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('lens-question')?.focus();
    }
  };

  const handleQuestionKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.topbarDot}></div>
          <span>OPENORI · AI 偏离度扫描</span>
        </div>
        <span className={styles.topbarRight}>LIVE</span>
      </div>

      <div className={styles.body}>
        <div className={styles.headline}>
          <h2 className={styles.headlineSerif}>
            AI 在怎么<br />介绍你的<em>品牌?</em>
          </h2>
          <p className={styles.headlineDesc}>
            输入品牌名和行业问题, <strong>30 秒</strong>看到豆包 / DeepSeek / 千问 / 文心 / Kimi / 智谱的真实回答, 附 <strong>AI 偏离度</strong>评分。
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>
              <span className={styles.fieldNum}>1</span>
              <span>品牌名</span>
            </div>
            <input
              type="text"
              className={styles.input}
              id="lens-brand"
              placeholder="Babycare / 珀莱雅 / 公司名"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              onKeyPress={handleBrandKeyPress}
              maxLength={100}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabel}>
              <span className={styles.fieldNum}>2</span>
              <span>行业问题</span>
            </div>
            <input
              type="text"
              className={styles.input}
              id="lens-question"
              placeholder="推荐国产母婴品牌 / 新能源汽车怎么选..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyPress={handleQuestionKeyPress}
              maxLength={200}
            />
          </div>

          <button type="submit" className={styles.submitBig} disabled={remaining === 0 || isLoading}>
            <span>{isLoading ? '扫描中...' : remaining === 0 ? '今日额度已用完' : '开始扫描'}</span>
            {!isLoading && remaining > 0 && <span className={styles.arrow}>→</span>}
          </button>
        </form>

        <div className={styles.promise}>
          <div className={styles.promiseRow}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="6" />
              <path d="M4 7l2 2 4-4" />
            </svg>
            <span>真实调用 6 大平台, <strong>非静态模拟</strong></span>
          </div>
          <div className={styles.promiseRow}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="6" />
              <path d="M4 7l2 2 4-4" />
            </svg>
            <span>自动生成 <strong>AI 偏离度</strong>评分</span>
          </div>
          <div className={styles.promiseRow}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="6" />
              <path d="M4 7l2 2 4-4" />
            </svg>
            <span><strong>30 秒出结果</strong> · 免费 · 无需注册</span>
          </div>
        </div>

        <div className={styles.logos}>
          <div className={styles.logosLabel}>覆盖 6 大国内 AI 平台</div>
          <div className={styles.logosScroll}>
            <div className={styles.logosTrack}>
              {/* Render twice for infinite scroll */}
              {[...PLATFORMS, ...PLATFORMS].map((p, idx) => (
                <div key={idx} className={styles.logoItem}>
                  <span className={styles.logoIcon} style={{ background: p.logoBg }}>
                    {p.logo}
                  </span>
                  <span className={styles.logoText}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.quota}>今日剩余 {remaining}/2 次</span>
      </div>
    </div>
  );
}
