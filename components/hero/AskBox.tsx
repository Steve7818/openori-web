'use client';

import { useState } from 'react';
import { PLATFORM_SLIDES } from '@/components/lens/oriReading/slides';
import styles from './AskBox.module.css';

interface AskBoxProps {
  onSubmit: (brand: string, question: string) => void;
  isLoading?: boolean;
}

const QUICK_PROMPTS = [
  {
    industry: '母婴',
    brand: 'Babycare',
    query: '给宝宝买纸尿裤选什么牌子?',
  },
  {
    industry: '运动',
    brand: 'Lululemon',
    query: '我想买一套瑜伽 outfit 有什么推荐?',
  },
  {
    industry: '新能源',
    brand: '比亚迪',
    query: '家用 SUV 想要 20 万以内推荐什么?',
  },
];

export default function AskBox({ onSubmit, isLoading }: AskBoxProps) {
  const [brand, setBrand] = useState('');
  const [question, setQuestion] = useState('');

  const canSubmit = brand.trim().length >= 2 && question.trim().length >= 4 && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(brand.trim(), question.trim());
  };

  const handleQuickSelect = (b: string, q: string) => {
    setBrand(b);
    setQuestion(q);
    onSubmit(b, q);
  };

  return (
    <div className={styles.askboxWrapper}>
      <div className={styles.askbox}>
        <div className={styles.askboxEyebrow}>
          问 Ori 一个问题
          <span className={styles.liveDot}></span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>品牌</div>
            <input
              type="text"
              className={`${styles.fieldInput} ${styles.brand}`}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Lululemon"
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>问题</div>
            <textarea
              className={`${styles.fieldInput} ${styles.question}`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="我想买一套瑜伽 outfit 有什么推荐?"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className={styles.askboxFooter}>
            <div className={styles.platformsRow}>
              <span className={styles.scanLabel}>扫描 6 大平台</span>
              <div className={styles.platformMarquee}>
                <div className={styles.platformTrack}>
                  {/* Set 1 */}
                  {PLATFORM_SLIDES.map((p) => (
                    <img key={`a-${p.platformId}`} src={p.logo} alt={p.brand} className={styles.platformLogoImg} />
                  ))}
                  {/* Set 2 mirror for seamless loop */}
                  {PLATFORM_SLIDES.map((p) => (
                    <img key={`b-${p.platformId}`} src={p.logo} alt={p.brand} className={styles.platformLogoImg} />
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
              →
            </button>
          </div>
        </form>
      </div>

      <div className={styles.quickSuggestions}>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className={styles.quickRow}
            onClick={() => handleQuickSelect(prompt.brand, prompt.query)}
            disabled={isLoading}
          >
            <span className={styles.quickCat}>{prompt.industry}</span>
            <span className={styles.quickBrand}>{prompt.brand}</span>
            <span className={styles.quickQuestion}>{prompt.query}</span>
            <span className={styles.quickArrow}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
