import styles from './HeroLeft.module.css';

export default function HeroLeft() {
  return (
    <div className={styles.left}>
      <h1 className={styles.h1}>
        世界在换一种<br />
        方式找<span className={styles.em}>答案</span>
      </h1>

      <p className={styles.sub}>
        <span className={styles.line}>从 GEO 起步,跨入 AI-原生战略咨询。</span>
        <span className={styles.line}>覆盖国内 <span className={styles.num}>6</span> 大 + 海外 <span className={styles.num}>3</span> 大 AI 平台,API、APP、Web 三端。</span>
        <span className={styles.line}>输出涵盖品牌、对手、行业、海外的战略研报。</span>
      </p>
    </div>
  );
}
