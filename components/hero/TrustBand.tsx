import styles from './TrustBand.module.css';

export default function TrustBand() {
  return (
    <div className={styles.trust}>
      <span className={styles.label}>生态合作</span>
      <div className={styles.marquee}>
        <div className={styles.track}>
          {/* Set 1 */}
          <img src="/logos/partners/ant-group.png" alt="蚂蚁集团" className={styles.logo} />
          <img src="/logos/partners/ant-financial.png" alt="蚂蚁金服" className={styles.logo} />
          <img src="/logos/partners/hello.png" alt="哈啰出行" className={styles.logo} />
          <img src="/logos/partners/catl.png" alt="宁德时代" className={styles.logo} />
          {/* Set 2 mirror for seamless loop */}
          <img src="/logos/partners/ant-group.png" alt="蚂蚁集团" className={styles.logo} />
          <img src="/logos/partners/ant-financial.png" alt="蚂蚁金服" className={styles.logo} />
          <img src="/logos/partners/hello.png" alt="哈啰出行" className={styles.logo} />
          <img src="/logos/partners/catl.png" alt="宁德时代" className={styles.logo} />
        </div>
      </div>
    </div>
  );
}
