'use client';

import { useState } from 'react';
import LensCard from './lens/LensCard';
import LensModal from './lens/LensModal';
import { useLensStream } from './lens/useLensStream';
import { getSessionId } from '@/lib/lens/storage';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brand, setBrand] = useState('');
  const [question, setQuestion] = useState('');
  const [dailyRemaining, setDailyRemaining] = useState(2);
  const { panels, status, start } = useLensStream();

  const handleLaunch = async (brandInput: string, questionInput: string) => {
    setBrand(brandInput);
    setQuestion(questionInput);
    setIsModalOpen(true);

    const sessionId = getSessionId();
    if (sessionId) {
      await start(sessionId, brandInput, questionInput);
      setDailyRemaining(prev => Math.max(0, prev - 1));
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.meta}>
            <span>01 · Origeno v2</span>
            <span>生成式引擎优化咨询</span>
          </div>

          <h1 className={styles.heroH1}>
            世界在换一种<br />方式找<em>答案。</em>
          </h1>

          <div className={styles.what}>
            <span className={styles.whatLabel}>// What is GEO</span>
            <p className={styles.whatText}>
              让品牌被 AI <em>看见、被推荐、被引用</em>。
            </p>
          </div>
        </div>

        <div className={styles.heroRight}>
          <LensCard onLaunch={handleLaunch} dailyRemaining={dailyRemaining} />
        </div>
      </section>

      <LensModal
        isOpen={isModalOpen}
        onClose={handleClose}
        brand={brand}
        question={question}
        panels={panels}
        sessionId={getSessionId() || ''}
        dailyRemaining={dailyRemaining}
      />
    </>
  );
}
