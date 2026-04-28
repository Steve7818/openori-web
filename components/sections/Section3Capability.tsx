'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag, useWheel } from '@use-gesture/react';
import styles from './Section3Capability.module.css';

const CHAPTERS = [
  {
    id: '01',
    name: '监听',
    anchor: '你搜自己,<em>昨天和今天不一样。</em>',
    body: '用户在豆包、DeepSeek、千问搜到你的品牌,AI 讲的版本每天都在变。Ori 持续把这些回答采回来,建成只属于你的 AI 资料库。',
    sting: '看一次不算数,得天天看。',
  },
  {
    id: '02',
    name: '诊断',
    anchor: '用户搜到你,<em>AI 却讲错了。</em>',
    body: '搜你的赛道却漏了你的品牌,绑了你的名字却带出竞品,引用了你的资质却用了过期信息。Ori 在 7 个维度<span class="dim-tags">(覆盖、关联、新鲜...)</span>持续打分,算出 AI 讲的版本跟你想要的差多远。',
    sting: '差在哪,差多少,看得到也追得到。',
  },
  {
    id: '03',
    name: '投放',
    anchor: '不是让 AI 多提你,<em>是让它讲对。</em>',
    body: '过去一周哪家信源在豆包最被引用,什么写法最被 AI 认,什么版本最贴你想要的故事 —— Ori 就投那家。',
    sting: '判断过了,才投。',
  },
  {
    id: '04',
    name: '回测',
    anchor: '投完那一秒,不是结束,而是刚开始。',
    body: '1 小时、6 小时、24 小时、72 小时,Ori 在六个平台持续追踪 AI 的回答 —— 哪家先改口,哪笔投放真生效,直接反哺下一轮判断。',
    sting: '一天一个闭环,一月太久。',
  },
];

export default function Section3Capability() {
  const [active, setActive] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [wheelLock, setWheelLock] = useState(false);

  const next = () => {
    setActive((prev) => (prev + 1) % 4);
    setRotation((prev) => prev - 90);
  };

  const prev = () => {
    setActive((prev) => (prev + 3) % 4);
    setRotation((prev) => prev + 90);
  };

  const gotoChapter = (idx: number) => {
    if (idx === active) return;
    let diff = idx - active;
    if (diff > 2) diff -= 4;
    if (diff < -2) diff += 4;
    setActive(idx);
    setRotation((prev) => prev - diff * 90);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prev();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  // Drag gesture
  const bindDrag = useDrag(
    ({ movement: [mx, my], last }) => {
      const THRESHOLD = 40;
      if (Math.abs(mx) > THRESHOLD || Math.abs(my) > THRESHOLD) {
        if (Math.abs(mx) > Math.abs(my)) {
          if (mx < 0) next();
          else prev();
        } else {
          if (my < 0) next();
          else prev();
        }
        setIsDragging(false);
      }
      if (last) {
        setTimeout(() => setIsDragging(false), 100);
      }
    },
    { threshold: 40 }
  );

  // Wheel gesture with debounce
  const bindWheel = useWheel(
    ({ delta: [dx, dy] }) => {
      if (wheelLock) return;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
        setWheelLock(true);
        if (dx > 0) next();
        else prev();
        setTimeout(() => setWheelLock(false), 900);
      }
    },
    { threshold: 30 }
  );

  const handleDialClick = () => {
    if (!isDragging) next();
  };

  // Calculate dial labels
  const labels = [
    CHAPTERS[active],
    CHAPTERS[(active + 1) % 4],
    CHAPTERS[(active + 2) % 4],
    CHAPTERS[(active + 3) % 4],
  ];

  return (
    <section className={styles.section3}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>// 03 // capability</div>
        <h2 className={styles.heading}>
          GEO 不是 SEO 的下一代,<em>而是跟顶级的 AI 模型持续对赌。</em>
        </h2>
        <p className={styles.sub}>
          OpenOri 的架构跟 AI 同步迭代。交付<span className={styles.pause}>,</span>明天的答案。
        </p>
      </div>

      {/* Stage: Dial + Content */}
      <div className={styles.stage}>
        {/* Dial */}
        <div
          className={styles.dialWrap}
          {...bindDrag()}
          {...bindWheel()}
          onClick={handleDialClick}
          onMouseDown={() => setIsDragging(true)}
          role="region"
          aria-label="浑天仪流程导航"
          tabIndex={0}
        >
          <svg className={styles.dial} viewBox="0 0 480 480">
            {/* 子午外环 fixed */}
            <circle cx="240" cy="240" r="200" fill="none" stroke="var(--border-medium)" strokeWidth="0.7" />
            <circle cx="240" cy="240" r="208" fill="none" stroke="var(--border-faint)" strokeWidth="0.4" />

            {/* Halo at fixed top */}
            <circle className={styles.haloOuter} cx="240" cy="60" r="22" fill="none" stroke="var(--ember)" strokeWidth="0.5" opacity="0.4" />
            <circle cx="240" cy="60" r="14" fill="none" stroke="var(--ember)" strokeWidth="0.7" opacity="0.5" />

            {/* Snap rotor */}
            <motion.g
              animate={{ rotate: rotation }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              style={{ transformOrigin: '240px 240px', transformBox: 'view-box' }}
            >
              {/* Equator (auto-drifting) */}
              <g className={styles.equatorSpin}>
                <path d="M 40 240 A 200 32 0 0 0 440 240" fill="none" stroke="var(--border-medium)" strokeWidth="0.55" />
                <path d="M 40 240 A 200 32 0 0 1 440 240" fill="none" stroke="var(--border-medium)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
              </g>

              {/* Ecliptic 23.5° tilt */}
              <g className={styles.eclipticSpin}>
                <g transform="rotate(-23.5 240 240)">
                  <path d="M 40 240 A 200 32 0 0 0 440 240" fill="none" stroke="var(--text-quaternary)" strokeWidth="0.55" />
                  <path d="M 40 240 A 200 32 0 0 1 440 240" fill="none" stroke="var(--text-quaternary)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.55" />
                </g>
              </g>

              {/* 4 chapter nodes at cardinals */}
              <circle cx="240" cy="60" r="6" fill="var(--ember)" />
              <circle cx="420" cy="240" r="4" fill="var(--text-quaternary)" />
              <circle cx="240" cy="420" r="4" fill="var(--text-quaternary)" />
              <circle cx="60" cy="240" r="4" fill="var(--text-quaternary)" />
            </motion.g>

            {/* 中心 brand fixed */}
            <circle cx="240" cy="240" r="6" fill="var(--ember)" />
            <circle cx="240" cy="240" r="11" fill="none" stroke="var(--ember)" strokeWidth="0.5" opacity="0.35" />

            {/* Center counter */}
            <text x="240" y="284" textAnchor="middle" fill="var(--text-quaternary)" fontSize="9" fontFamily="var(--mono)" letterSpacing="1.8">
              ↻ DAILY · CYCLE
            </text>
          </svg>

          {/* HTML labels overlay */}
          <div className={styles.dialLabels}>
            <div className={`${styles.dialLabel} ${styles.dialLabelTop} ${styles.active}`}>
              {labels[0].id} · {labels[0].name}
            </div>
            <div className={`${styles.dialLabel} ${styles.dialLabelRight}`}>{labels[1].id}</div>
            <div className={`${styles.dialLabel} ${styles.dialLabelBottom}`}>{labels[2].id}</div>
            <div className={`${styles.dialLabel} ${styles.dialLabelLeft}`}>{labels[3].id}</div>
          </div>
        </div>

        {/* Chapter Content */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {CHAPTERS.map((chapter, idx) =>
              idx === active ? (
                <motion.article
                  key={idx}
                  className={styles.chapter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={styles.chapterMeta}>
                    CHAPTER {chapter.id} · {chapter.name}
                    <span className={styles.chapterMetaDivider}></span>
                    <span className={styles.chapterMetaCounter}>
                      {chapter.id} / 04
                    </span>
                  </div>
                  <h3 className={styles.chapterAnchor} dangerouslySetInnerHTML={{ __html: chapter.anchor }} />
                  <p className={styles.chapterBody} dangerouslySetInnerHTML={{ __html: chapter.body }} />
                  <p className={styles.chapterSting}>{chapter.sting}</p>
                </motion.article>
              ) : null
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Bar */}
      <div className={styles.nav}>
        <button className={styles.navPrev} onClick={prev} aria-label="上一章">
          ← PREV
        </button>
        <div className={styles.navProgress}>
          {CHAPTERS.map((_, idx) => (
            <span
              key={idx}
              className={`${styles.navDot} ${idx === active ? styles.active : ''}`}
              onClick={() => gotoChapter(idx)}
              role="button"
              tabIndex={0}
            />
          ))}
        </div>
        <div className={styles.navHint}>滑动 / ← → / 拖拽 dial</div>
        <button className={styles.navNext} onClick={next} aria-label="下一章">
          NEXT →
        </button>
      </div>
    </section>
  );
}
