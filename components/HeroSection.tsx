'use client';

import { useState, useEffect, useRef } from 'react';
import BrandLockup from './hero/BrandLockup';
import HeroLeft from './hero/HeroLeft';
import AskBox from './hero/AskBox';
import TrustBand from './hero/TrustBand';
import AmbientBackground from './hero/AmbientBackground';
import LensModal from './lens/LensModal';
import { useLensStream } from './lens/useLensStream';
import { initLensSession } from '@/lib/lens/api';
import { getSessionId, setSessionId } from '@/lib/lens/storage';
import { loadTurnstileScript, renderTurnstile, type TurnstileWidget } from '@/lib/lens/turnstile';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  initialLensDebug?: boolean;
  initialPage?: number;
}

export default function HeroSection({ initialLensDebug = false, initialPage = 1 }: HeroSectionProps) {
  const shouldOpenModal = initialLensDebug && process.env.NEXT_PUBLIC_LENS_DEBUG === '1';

  const [isModalOpen, setIsModalOpen] = useState(shouldOpenModal);
  const [brand, setBrand] = useState(shouldOpenModal ? 'Babycare' : '');
  const [question, setQuestion] = useState(shouldOpenModal ? '推荐国产母婴品牌' : '');
  const [dailyRemaining, setDailyRemaining] = useState(2);
  const { panels, status, error, oriReading, start } = useLensStream();
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

  // Auto-start stream in debug mode
  useEffect(() => {
    if (shouldOpenModal && brand && question && status === 'idle') {
      sessionReady.current.then(sessionId => {
        if (sessionId) {
          console.log('[DEBUG] Auto-starting stream:', { sessionId, brand, question });
          start(sessionId, brand, question);
        }
      });
    }
  }, [shouldOpenModal, brand, question, status, start]);

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
        // Add 5s timeout to prevent infinite hang
        turnstileToken = await Promise.race([
          turnstileWidget.current.execute(),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Turnstile timeout')), 5000)
          )
        ]);
      } catch (err) {
        console.warn('Turnstile execute failed (non-blocking):', err);
        // Continue without token - backend will allow test key
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

      <div className={styles.page}>
        <AmbientBackground />

        <header className={styles.topbar}>
          <BrandLockup />
          <nav className={styles.nav}>
            <a href="#approach">方法</a>
            <a href="#cases">案例</a>
            <a href="#about">关于</a>
            <a href="#contact">联系</a>
          </nav>
        </header>

        <main className={styles.hero}>
          <div className={styles.leftColumn}>
            <HeroLeft />
            <TrustBand />
          </div>

          <AskBox onSubmit={handleLaunch} isLoading={status === 'streaming'} />
        </main>
      </div>

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
        oriReading={oriReading}
        initialPage={initialPage}
      />
    </>
  );
}
