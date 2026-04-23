'use client';

import styles from './OriSummary.module.css';

interface OriSummaryProps {
  text: string | null;
  streamStatus: 'idle' | 'streaming' | 'done' | 'error';
}

export default function OriSummary({ text, streamStatus }: OriSummaryProps) {
  // 扫描完成但 Ori 还没到 —— 显示 loading
  if (streamStatus === 'done' && !text) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>// Ori · 正在汇总</span>
        </div>
        <div className={styles.loadingBody}>
          <div className={styles.skeletonLine} style={{ width: '85%' }}></div>
          <div className={styles.skeletonLine} style={{ width: '92%' }}></div>
          <div className={styles.skeletonLine} style={{ width: '70%' }}></div>
          <div className={styles.hint}>Ori 正在把这 6 家 AI 的结果拼起来看……</div>
        </div>
      </div>
    );
  }

  // 还在扫描中 —— 不显示
  if (streamStatus !== 'done' || !text) return null;

  // 拆分 Ori 正文 + disclaimer(用 "——" 分隔符)
  const parts = text.split(/\n\s*——\s*\n/);
  const mainBody = parts[0] || text;
  const disclaimer = parts.length > 1 ? parts.slice(1).join('\n——\n') : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>// Ori · 初步读取</span>
      </div>
      <div className={styles.body}>
        {mainBody.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className={styles.paragraph}>
            {paragraph.trim()}
          </p>
        ))}
      </div>
      {disclaimer && (
        <>
          <div className={styles.divider}>——</div>
          <div className={styles.disclaimer}>
            {disclaimer.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className={styles.disclaimerParagraph}>
                {paragraph.trim()}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
