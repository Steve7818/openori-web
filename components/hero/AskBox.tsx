'use client';

import { useState } from 'react';
import styles from './AskBox.module.css';

interface AskBoxProps {
  onSubmit: (brand: string, question: string) => void;
  isLoading?: boolean;
}

const QUICK_PROMPTS = [
  {
    industry: '母婴',
    brand: 'Babycare',
    query: '国产母婴品牌推荐',
  },
  {
    industry: '运动',
    brand: 'Lululemon',
    query: '瑜伽裤如何选',
  },
  {
    industry: '新能源',
    brand: '比亚迪',
    query: '家用车选购建议',
  },
];

export default function AskBox({ onSubmit, isLoading }: AskBoxProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Parse input to extract brand and question
    // For now, use a simple heuristic or default
    onSubmit('Babycare', input.trim());
  };

  const handleQuickPrompt = (prompt: typeof QUICK_PROMPTS[0]) => {
    const fullQuery = `${prompt.brand} ${prompt.query}`;
    setInput(fullQuery);
    onSubmit(prompt.brand, fullQuery);
  };

  return (
    <aside className={styles.askbox}>
      <div className={styles.header}>
        <h2 className={styles.eyebrow}>
          问 <span className={styles.ai}>Ori</span> 一个问题
        </h2>
        <div className={styles.live}>
          <span className={styles.dot}></span>
          <span>LIVE</span>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
          placeholder="例: 推荐母婴品牌时,AI 会提到 Babycare 吗?"
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <span className={styles.meta}>扫描 6 大平台</span>
        <button type="submit" className={styles.submit} aria-label="提交" disabled={isLoading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M19 12l-6-6M19 12l-6 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>

      <span className={styles.suggestionsLabel}>— 快速试</span>
      <div className={styles.suggestions}>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            className={styles.suggestion}
            type="button"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isLoading}
          >
            <span className={styles.bullet}>◇</span>
            <span className={styles.suggestionText}>
              <span className={styles.industry}>{prompt.industry}</span>
              {prompt.brand} {prompt.query}
            </span>
            <span className={styles.arrow}>→</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
