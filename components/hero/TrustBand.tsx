import styles from './TrustBand.module.css';

const LOGOS = ['蚂蚁集团', '蚂蚁金服', '哈啰出行', '宁德时代'];

export default function TrustBand() {
  return (
    <div className={styles.trust}>
      <span className={styles.label}>生态合作</span>
      <div className={styles.marquee}>
        <div className={styles.track}>
          {/* Set 1 */}
          {LOGOS.map((logo, idx) => (
            <span key={`set1-${idx}`} className={styles.logo}>
              {logo}
            </span>
          ))}
          {/* Set 2 (mirror for seamless loop) */}
          {LOGOS.map((logo, idx) => (
            <span key={`set2-${idx}`} className={styles.logo}>
              {logo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
