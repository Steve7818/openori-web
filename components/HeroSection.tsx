'use client';

import { useState, useEffect, useRef } from 'react';
import LensCard from './lens/LensCard';
import LensModal from './lens/LensModal';
import { useLensStream } from './lens/useLensStream';
import { initLensSession } from '@/lib/lens/api';
import { getSessionId, setSessionId } from '@/lib/lens/storage';
import { loadTurnstileScript, renderTurnstile, type TurnstileWidget } from '@/lib/lens/turnstile';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brand, setBrand] = useState('');
  const [question, setQuestion] = useState('');
  const [dailyRemaining, setDailyRemaining] = useState(2);
  const { panels, status, error, start } = useLensStream();
  const sessionReady = useRef<Promise<string | null>>(null!);
  const turnstileWidget = useRef<TurnstileWidget | null>(null);
  const turnstileContainer = useRef<HTMLDivElement>(null);

  // Eagerly ensure session exists — start on mount, share the promise
  useEffect(() => {
    const existing = getSessionId();
    if (existing) {
      sessionReady.current = Promise.resolve(existing);
    } else {
      sessionReady.current = initLensSession()
        .then(data => {
          setSessionId(data.session_id);
          setDailyRemaining(data.daily_remaining);
          return data.session_id;
        })
        .catch(err => {
          console.error('Failed to init session:', err);
          return null;
        });
    }

    // Load Turnstile script
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
    loadTurnstileScript()
      .then(() => {
        if (turnstileContainer.current) {
          return renderTurnstile(turnstileContainer.current, siteKey);
        }
      })
      .then(widget => {
        if (widget) turnstileWidget.current = widget;
      })
      .catch(err => {
        console.warn('Turnstile load failed (non-blocking):', err);
      });
  }, []);

  const handleLaunch = async (brandInput: string, questionInput: string) => {
    setBrand(brandInput);
    setQuestion(questionInput);
    setIsModalOpen(true);

    // Await the session promise (either already resolved or in-flight)
    let sessionId = await sessionReady.current;

    // Fallback: retry once if initial attempt failed
    if (!sessionId) {
      try {
        const data = await initLensSession();
        setSessionId(data.session_id);
        setDailyRemaining(data.daily_remaining);
        sessionId = data.session_id;
      } catch (err) {
        console.error('Session init retry failed:', err);
      }
    }

    // Get Turnstile token (invisible mode, auto-executes)
    let turnstileToken: string | undefined;
    if (turnstileWidget.current) {
      try {
        turnstileToken = await turnstileWidget.current.execute();
      } catch (err) {
        console.warn('Turnstile execute failed (non-blocking):', err);
      }
    }

    if (sessionId) {
      await start(sessionId, brandInput, questionInput, turnstileToken);
      setDailyRemaining(prev => Math.max(0, prev - 1));
    } else {
      console.error('Failed to get session ID after retries');
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Turnstile invisible widget container */}
      <div ref={turnstileContainer} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

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
          <LensCard
            onLaunch={handleLaunch}
            dailyRemaining={dailyRemaining}
            isLoading={status === 'streaming'}
          />
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
        streamStatus={status}
        streamError={error}
      />
    </>
  );
}
