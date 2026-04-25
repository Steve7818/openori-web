import styles from './BrandLockup.module.css';

export default function BrandLockup() {
  return (
    <div className={styles.lockup}>
      <div className={styles.mark}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none">
          {/* Equator */}
          <ellipse cx="100" cy="100" rx="76" ry="24" stroke="#f0ebe2" strokeWidth="6.5"/>
          {/* Gnomon */}
          <line x1="68" y1="22" x2="132" y2="178" stroke="#f0ebe2" strokeWidth="3"/>
          {/* Ecliptic (static) */}
          <ellipse cx="100" cy="100" rx="62" ry="19" stroke="#f0ebe2" strokeWidth="4" strokeOpacity="0.88" transform="rotate(-23.5 100 100)"/>
          {/* Ember */}
          <circle cx="100" cy="100" r="9" fill="#d97757"/>
        </svg>
      </div>
      <div className={styles.text}>
        <span className={styles.wordmark}>
          Open<span className={styles.ori}>Ori</span>
        </span>
        <div className={styles.tagline}>
          <span className={styles.cn}>成为答案的答案</span>
          <span className={styles.sep}>·</span>
          <span className={styles.en}>The answer behind the answers</span>
        </div>
      </div>
    </div>
  );
}
