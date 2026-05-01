'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import styles from './Section4Proof.module.css';
import {
  INDUSTRIES, CHART, dayToX, deviationToY, samplingToY, getBarStyle,
} from './section4Data';

const EDU = INDUSTRIES[0];
const { xLeft, xRight, yTop, yBottom } = CHART;

export default function Section4Proof() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const paths = useMemo(() => {
    const devPts = EDU.deviations.map((d, i) => `${dayToX(i)},${deviationToY(d)}`);
    const deviationPath = 'M ' + devPts.join(' L ');
    const glowPath = deviationPath;

    const sampPts = EDU.samplings.map((s, i) => `${dayToX(i)},${samplingToY(s)}`);
    const samplingPath =
      'M ' + sampPts.join(' L ') +
      ` L ${xRight},${yBottom} L ${xLeft},${yBottom} Z`;
    const areaTopPath = 'M ' + sampPts.join(' L ');

    const bars = EDU.placements.map((h, i) => ({
      x: dayToX(i) - CHART.barWidth / 2,
      y: yBottom - h,
      width: CHART.barWidth,
      height: h,
      ...getBarStyle(h),
      delay: 1500 + i * 60,
    }));

    return { deviationPath, glowPath, samplingPath, areaTopPath, bars };
  }, []);

  const targetMinY = deviationToY(EDU.targetBand.min);
  const targetMaxY = deviationToY(EDU.targetBand.max);

  return (
    <section ref={sectionRef} className={`${styles.section4} ${revealed ? styles.revealed : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>§ 04 · PROOF</p>
        <h2 className={styles.heading}>
          28天GEO周期，<em>偏离值收敛至目标带</em>
        </h2>
        <p className={styles.sub}>
          每一次采样、每一次投放，都在缩小品牌表达与AI认知之间的距离。
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.industry}
            className={`${styles.tab} ${ind.enabled ? styles.active : ''}`}
            disabled={!ind.enabled}
          >
            {ind.label}
            {!ind.enabled && <span className={styles.tabTba}>TBA</span>}
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <div className={styles.chartCard}>
        <svg
          className={styles.chartSvg}
          viewBox={CHART.viewBox}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sampling-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97757" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#A04425" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#5C2818" stopOpacity="0.25" />
            </linearGradient>
            <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF8B5C" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FF8B5C" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Target band */}
          <g className={styles.phaseTargetBand}>
            <rect
              x={xLeft} y={targetMaxY}
              width={xRight - xLeft} height={targetMinY - targetMaxY}
              className={styles.targetBandBg}
            />
            <line x1={xLeft} y1={targetMaxY} x2={xRight} y2={targetMaxY} className={styles.targetBandLine} />
            <text x={xRight + 10} y={targetMaxY + 14} textAnchor="start" className={styles.targetBandLabel}>
              {EDU.targetBand.label}
            </text>
          </g>

          {/* Y axes */}
          <g className={styles.phaseAxes}>
            {/* Left axis: 次数 0-100 */}
            {[0, 25, 50, 75, 100].map((v) => {
              const y = samplingToY(v);
              return (
                <g key={`left-${v}`}>
                  <line x1={xLeft - 6} y1={y} x2={xRight} y2={y}
                    stroke="rgba(240,235,226,0.04)" strokeWidth="0.5" />
                  <text x={xLeft - 10} y={y + 4} textAnchor="end" className={styles.axisLabel}>{v}</text>
                </g>
              );
            })}
            <text
              x={xLeft - 40} y={(samplingToY(0) + samplingToY(100)) / 2}
              textAnchor="middle" className={styles.axisTitle}
              transform={`rotate(-90, ${xLeft - 40}, ${(samplingToY(0) + samplingToY(100)) / 2})`}
            >次数</text>

            {/* Right axis: 偏离值 0-1.0 */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((v) => {
              const y = deviationToY(v);
              const isBand = v === 0.25;
              return (
                <g key={`right-${v}`}>
                  <text
                    x={xRight + 10} y={y + 4} textAnchor="start"
                    className={isBand ? styles.axisLabelEmber : styles.axisLabel}
                  >{v.toFixed(2)}</text>
                </g>
              );
            })}
            <text
              x={xRight + 50} y={(yTop + yBottom) / 2}
              textAnchor="middle" className={styles.axisTitle}
              transform={`rotate(90, ${xRight + 50}, ${(yTop + yBottom) / 2})`}
            >偏离值</text>

            {/* X axis: Day labels */}
            {[0, 7, 14, 21, 28].map((d) => (
              <text key={`day-${d}`} x={dayToX(d)} y={yBottom + 20} textAnchor="middle"
                className={styles.axisLabelMajor}>
                Day {d}
              </text>
            ))}
            <text x={(xLeft + xRight) / 2} y={yBottom + 40} textAnchor="middle" className={styles.axisTitle}>
              GEO CYCLE DAY
            </text>
          </g>

          {/* Sampling area */}
          <path d={paths.samplingPath} className={`${styles.layerSampling} ${styles.phaseArea}`} />
          <path d={paths.areaTopPath} className={`${styles.areaTopLine} ${styles.phaseArea}`} />

          {/* Deviation curve glow */}
          <path d={paths.glowPath} className={`${styles.devGlow} ${styles.phaseCurveGlow}`} />
          {/* Deviation curve */}
          <path d={paths.deviationPath} className={`${styles.devLine} ${styles.phaseCurve}`} />

          {/* Placement bars */}
          {paths.bars.map((b, i) => b.height > 0 && (
            <rect
              key={i}
              x={b.x} y={b.y} width={b.width} height={b.height}
              fill={b.fill} opacity={b.opacity}
              className={styles.phaseBar}
              style={{ animationDelay: `${b.delay}ms` }}
            />
          ))}

          {/* Event strips + nodes */}
          {EDU.events.map((ev, ni) => {
            const x = dayToX(ev.dayIndex);
            const devY = deviationToY(EDU.deviations[ev.dayIndex]);
            const nodeDelay = 2500 + ni * 200;
            const breatheDelay = nodeDelay + 350;
            const stripY = yTop - 60;

            return (
              <g key={ev.dayIndex}>
                {/* Vertical strip line */}
                <line
                  x1={x} y1={stripY + 30} x2={x} y2={devY - 8}
                  className={`${styles.eventStripLine} ${styles.phaseStrip}`}
                />
                {/* Strip label */}
                <g className={styles.phaseStrip}>
                  <text x={x} y={stripY + 14} textAnchor="middle" className={styles.eventStripLabel}>
                    {ev.label}
                  </text>
                  <text x={x} y={stripY + 26} textAnchor="middle" className={styles.eventStripDeviation}>
                    {ev.sublabel}
                  </text>
                </g>

                {/* Breathe ring */}
                <circle
                  cx={x} cy={devY} r={14}
                  className={`${styles.eventRing} ${ev.breathe === 'soft' ? styles.breatheSoft : styles.breatheStrong} ${styles.phaseNode}`}
                  style={{ animationDelay: `${breatheDelay}ms` }}
                />
                {/* Node */}
                <circle
                  cx={x} cy={devY} r={5}
                  className={`${styles.eventNode} ${styles.phaseNode}`}
                  style={{ animationDelay: `${nodeDelay}ms` }}
                />
              </g>
            );
          })}

          {/* Achievement badge on last event */}
          {(() => {
            const last = EDU.events[EDU.events.length - 1];
            const x = dayToX(last.dayIndex);
            const devY = deviationToY(EDU.deviations[last.dayIndex]);
            return (
              <g className={styles.phaseStrip}>
                <rect x={x + 16} y={devY - 9} width={104} height={18} rx={3}
                  className={styles.achievementBadge} />
                <text x={x + 68} y={devY + 3} textAnchor="middle" className={styles.achievementText}>
                  TARGET ACHIEVED
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.swatchLine} />
            <span>偏离值曲线</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.swatchArea} />
            <span>采样频率</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.swatchBar} />
            <span>投放事件</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.swatchEvent} />
            <span>关键节点</span>
          </div>
        </div>
      </div>
    </section>
  );
}
