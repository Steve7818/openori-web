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
      <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" fill="none" strokeLinecap="round">
        {/* Equator (horizontal large ellipse) */}
        <ellipse cx="720" cy="450" rx="304" ry="96" stroke="#f0ebe2" strokeWidth="3.2"/>
        {/* Gnomon (tilted axis line) */}
        <line x1="448" y1="162" x2="992" y2="738" stroke="#f0ebe2" strokeWidth="2"/>
        {/* Ecliptic ring (rotating) */}
        <g className={styles.ecliptic}>
          <ellipse cx="720" cy="450" rx="248" ry="76" stroke="#f0ebe2" strokeWidth="2.4" transform="rotate(-23.5 720 450)"/>
        </g>
        {/* Ember (pulsing) */}
        <circle className={styles.ember} cx="720" cy="450" r="9.6" fill="#d97757"/>
      </svg>
    </div>
  );
}
