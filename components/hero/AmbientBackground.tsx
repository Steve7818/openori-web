'use client';

import { useEffect, useRef } from 'react';
import styles from './AmbientBackground.module.css';

export default function AmbientBackground() {
  const ambientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section3 = document.getElementById('section3-capability');
    if (!section3 || !ambientRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ambientRef.current?.classList.add(styles.isFaded);
          } else {
            ambientRef.current?.classList.remove(styles.isFaded);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -70% 0px',
      }
    );

    observer.observe(section3);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ambientRef} className={styles.ambient}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" strokeLinecap="round">
        {/* Equator (horizontal large ellipse) */}
        <ellipse cx="100" cy="100" rx="76" ry="24" stroke="#f0ebe2" strokeWidth="0.8"/>
        {/* Gnomon (tilted axis line) */}
        <line x1="68" y1="22" x2="132" y2="178" stroke="#f0ebe2" strokeWidth="0.5"/>
        {/* Ecliptic ring (rotating) */}
        <g className={styles.ecliptic}>
          <ellipse cx="100" cy="100" rx="62" ry="19" stroke="#f0ebe2" strokeWidth="0.6" transform="rotate(-23.5 100 100)"/>
        </g>
        {/* Ember (pulsing) */}
        <circle className={styles.ember} cx="100" cy="100" r="2.4" fill="#d97757"/>
      </svg>
    </div>
  );
}
