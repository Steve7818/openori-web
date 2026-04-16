'use client';

import { useEffect } from 'react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  useEffect(() => {
    const signals = ['sig1', 'sig2', 'sig3', 'sig4']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const positionSets: [number, number][][] = [
      [[28, 68], [62, 38], [45, 75], [72, 58]],
      [[35, 30], [68, 62], [25, 55], [55, 72]],
      [[58, 25], [30, 62], [70, 48], [48, 70]],
      [[42, 38], [65, 70], [32, 72], [58, 30]],
      [[50, 32], [35, 55], [70, 65], [28, 70]],
    ];

    let currentSet = 0;
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    function randomizeSignals() {
      const positions = positionSets[currentSet];
      currentSet = (currentSet + 1) % positionSets.length;

      signals.forEach((sig, i) => {
        sig.classList.remove('visible', 'fade-out');

        const appearDelay = 300 + i * 1500 + Math.random() * 500;

        sig.style.top = positions[i][0] + '%';
        sig.style.left = positions[i][1] + '%';

        timeoutIds.push(
          setTimeout(() => sig.classList.add('visible'), appearDelay)
        );
        timeoutIds.push(
          setTimeout(() => {
            sig.classList.remove('visible');
            sig.classList.add('fade-out');
          }, appearDelay + 2500 + Math.random() * 1000)
        );
      });
    }

    randomizeSignals();
    intervalId = setInterval(randomizeSignals, 8000);

    return () => {
      clearInterval(intervalId);
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <div className={styles.logo}>Origeno</div>
          <div className={styles.navLinks}>
            <a href="#">方法</a>
            <a href="#">案例</a>
            <a href="#">关于</a>
          </div>
        </nav>

        <div className={styles.heroMain}>
          {/* 左栏:编辑体叙事 */}
          <div className={styles.leftColumn}>
            <h1 className={styles.h1}>
              世界在换一种
              <br />
              <span className="highlight">方式找答案</span>
            </h1>

            <div className={styles.what}>
              <span className={styles.geoFull}>GEO</span>
              (Generative Engine Optimization) · 让品牌被 AI 看见、被推荐、被引用
            </div>

            <div className={styles.judgment}>
              AI 不再只是回答问题,它正在接管用户的决策与消费
            </div>

            <div className={styles.facts}>
              <div className={styles.fact}>
                <span className={styles.factNum}>01</span>
                <span className={styles.factBody}>
                  Google 搜索市场份额
                  <span className="highlight">跌破 90%</span>,为 10 年来首次
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factNum}>02</span>
                <span className={styles.factBody}>
                  豆包<span className="highlight">日活破 1 亿</span>,DeepSeek 上线 20 天突破 2000 万
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factNum}>03</span>
                <span className={styles.factBody}>
                  ChatGPT 已支持
                  <span className="highlight">对话内下单</span>,AI Agent 开始替用户直接完成交易
                </span>
              </div>
            </div>

            <div className={styles.mission}>
              帮您的企业<span className="highlight">成为答案的答案</span>
            </div>

            <div className={styles.who}>
              Origeno 以{' '}
              <span className="highlight">Claude、ChatGPT、Perplexity</span>{' '}
              等全球顶级模型为底座,服务来自阿里生态、大健康、法律、教育、出行等多行业的品牌团队,让他们成为 AI 时代可见度最高的企业
            </div>

            <div className={styles.sloganEn}>
              <span className={styles.sloganBrand}>Origeno.</span> Be the answer AI remembers
            </div>
          </div>

          {/* 驾驶舱 */}
          <div className={styles.cockpit}>
            <div className={styles.cockpitReadout}>
              <div className={styles.readoutItem}>
                <span className={styles.readoutLabel}>Terminals</span>
                <span className={`${styles.readoutValue} ${styles.active}`}>10</span>
              </div>
              <div className={styles.readoutItem}>
                <span className={styles.readoutLabel}>Queries</span>
                <span className={styles.readoutValue}>128,442</span>
              </div>
              <div className={styles.readoutItem}>
                <span className={styles.readoutLabel}>Latency</span>
                <span className={styles.readoutValue}>04ms</span>
              </div>
            </div>

            <div className={styles.theodolite}>
              <span className={`${styles.tAngle} ${styles.top}`}>α</span>
              <span className={`${styles.tAngle} ${styles.right}`}>β</span>
              <span className={`${styles.tAngle} ${styles.bottom}`}>γ</span>
              <span className={`${styles.tAngle} ${styles.left}`}>δ</span>

              <div className={styles.tRingOuter} />
              <div className={styles.tRingMid} />
              <div className={styles.tRingInner} />
              <div className={styles.tCrossH} />
              <div className={styles.tCrossV} />

              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div
                  key={deg}
                  className={styles.tTick}
                  style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
                />
              ))}

              <div className={styles.tSweep} />

              <div className={styles.tSignal} id="sig1" />
              <div className={styles.tSignal} id="sig2" />
              <div className={styles.tSignal} id="sig3" />
              <div className={styles.tSignal} id="sig4" />

              <div className={styles.tCenter} />
            </div>

            <div className={styles.cockpitTicker}>
              <div className={styles.tickerRow}>
                {[...Array(2)].map((_, rep) => (
                  <span key={rep} className={styles.tickerGroup}>
                    <span className={styles.tickerItem}><span className={styles.dot} />ChatGPT</span>
                    <span className={styles.tickerItem}><span className={styles.dot} />Claude</span>
                    <span className={styles.tickerItem}><span className={styles.dot} />Gemini</span>
                    <span className={styles.tickerItem}><span className={`${styles.dot} ${styles.dim}`} />Perplexity</span>
                    <span className={styles.tickerItem}><span className={styles.dot} />Grok</span>
                    <span className={styles.tickerItem}><span className={`${styles.dot} ${styles.dim}`} />Copilot</span>
                    <span className={styles.tickerItem}><span className={styles.dot} />豆包</span>
                    <span className={styles.tickerItem}><span className={styles.dot} />DeepSeek</span>
                    <span className={styles.tickerItem}><span className={`${styles.dot} ${styles.dim}`} />文心一言</span>
                    <span className={styles.tickerItem}><span className={styles.dot} />通义千问</span>
                    <span className={styles.tickerItem}><span className={styles.dot} />Kimi</span>
                    <span className={styles.tickerItem}><span className={`${styles.dot} ${styles.dim}`} />智谱 GLM</span>
                    <span className={styles.tickerItem}><span className={styles.dot} />腾讯元宝</span>
                    <span className={styles.tickerItem}><span className={`${styles.dot} ${styles.dim}`} />讯飞星火</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.peek}>
        <div className={styles.peekDividerLong} />
        <div className={styles.peekRow}>
          <span className={styles.peekLabel}>02 · The Problem</span>
          <div className={styles.peekTitleWrap}>
            <div className={styles.peekTitle}>你的品牌,在 AI 里消失了</div>
          </div>
          <span className={styles.peekArrow}>↓ 继续</span>
        </div>
      </section>
    </>
  );
}
