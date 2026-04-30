// §4 Proof Section — Chart Data Layer
// Phase A: 教育 industry only. Phase B will add 大健康/制造业/美妆.

export interface Section4Event {
  dayIndex: number;       // 0-28
  label: string;          // event title (placeholder for now)
  sublabel: string;       // deviation change or description
  breathe: 'soft' | 'strong';
}

export interface Section4ChartData {
  industry: string;       // internal key
  label: string;          // tab display label
  cycleDays: number;
  enabled: boolean;       // Phase A: only 教育 is true

  // Raw number arrays — 29 values (Day 0 through Day 28)
  // Component computes SVG paths via useMemo
  deviations: number[];   // 0-1 scale, e.g. 0.78 = 78% deviation
  samplings: number[];    // 0-100 scale, backtesting frequency per day
  placements: number[];   // bar height in px: 0 | 20 | 35 | 55 | 80

  events: Section4Event[];

  targetBand: {
    min: number;          // deviation value (e.g. 0)
    max: number;          // deviation value (e.g. 0.25)
    label: string;
  };
}

// Bar color tiers based on height
// 80px → #FFB088 (BIG)
// 55px → #FF8B5C opacity 0.95 (MID)
// 35px → #D97757 opacity 0.85 (SMALL)
// 20px → #9C4A2E opacity 0.7 (TINY)
export function getBarStyle(height: number): { fill: string; opacity: number } {
  if (height >= 80) return { fill: '#FFB088', opacity: 1 };
  if (height >= 55) return { fill: '#FF8B5C', opacity: 0.95 };
  if (height >= 35) return { fill: '#D97757', opacity: 0.85 };
  return { fill: '#9C4A2E', opacity: 0.7 };
}

// Chart coordinate system constants (matching mockup viewBox 1500×580)
export const CHART = {
  viewBox: '0 0 1500 580',
  xLeft: 80,
  xRight: 1380,
  yTop: 140,       // deviation 0 (top of chart area)
  yBottom: 440,    // deviation 1.0 / sampling 0 / bar baseline
  barWidth: 10,
  totalDays: 29,   // Day 0 through Day 28
} as const;

// Compute x position for a given day index (0-28)
export function dayToX(dayIndex: number): number {
  const { xLeft, xRight, totalDays } = CHART;
  return xLeft + (dayIndex / (totalDays - 1)) * (xRight - xLeft);
}

// Compute y position for a deviation value (0-1, inverted: 0=top, 1=bottom)
export function deviationToY(dev: number): number {
  const { yTop, yBottom } = CHART;
  return yTop + dev * (yBottom - yTop);
}

// Compute y position for a sampling value (0-100, 0=bottom, 100=top of sampling zone)
// Sampling zone occupies bottom ~1/3 of chart (y 360-440)
export function samplingToY(val: number): number {
  const samplingTop = 265;  // max mountain peak from mockup
  const samplingBottom = CHART.yBottom;
  return samplingBottom - (val / 100) * (samplingBottom - samplingTop);
}

// ============================================================
// 教育 Industry Dataset (extracted from unified_final_4.html)
// ============================================================
const EDUCATION: Section4ChartData = {
  industry: 'education',
  label: '教育',
  cycleDays: 28,
  enabled: true,

  // 29 deviation values: starts at 0.78, descends to 0.21
  // Extracted from mockup curve y-coordinates → deviation scale
  deviations: [
    0.78, 0.76, 0.74, 0.71, 0.67, 0.64, 0.61,  // Day 0-6 (gradual descent)
    0.59, 0.53, 0.48, 0.44, 0.41, 0.39, 0.38,   // Day 7-13 (post-placement acceleration)
    0.35, 0.32, 0.30, 0.29, 0.28, 0.27, 0.25,   // Day 14-20 (steady improvement)
    0.23, 0.22, 0.21, 0.20, 0.20, 0.20, 0.20, 0.20, // Day 21-28 (plateau in target band)
  ],

  // 29 sampling values: low early (12-28), spikes at placement days
  // Extracted from mockup area heights
  samplings: [
    12, 15, 18, 22, 20, 28, 25,                 // Day 0-6 (startup period, low)
    88, 68, 42, 62, 40, 36, 38,                  // Day 7-13 (post-placement spike)
    55, 42, 40, 38, 36, 36, 40,                  // Day 14-20 (settling)
    92, 75, 46, 68, 50, 42, 40, 38,              // Day 21-28 (second placement spike)
  ],

  // 29 bar heights (px): 0=no bar, 20/35/55/80 = tiny/small/mid/big
  placements: [
    35, 20, 20, 35, 20, 35, 20,                 // Day 0-6
    80, 55, 35, 55, 35, 20, 35,                  // Day 7-13 (Day 7 = BIG placement)
    55, 35, 20, 35, 20, 20, 35,                  // Day 14-20
    80, 55, 35, 55, 35, 35, 20, 35,              // Day 21-28 (Day 21 = BIG placement)
  ],

  events: [
    {
      dayIndex: 0,
      label: '[事件描述 placeholder]',
      sublabel: '基线 0.78',
      breathe: 'soft',
    },
    {
      dayIndex: 7,
      label: '[事件描述 placeholder]',
      sublabel: '0.62 → 0.55',
      breathe: 'soft',
    },
    {
      dayIndex: 14,
      label: '[事件描述 placeholder]',
      sublabel: '[阶段描述]',
      breathe: 'soft',
    },
    {
      dayIndex: 21,
      label: '[事件描述 placeholder]',
      sublabel: '0.27 → 0.24',
      breathe: 'soft',
    },
    {
      dayIndex: 28,
      label: '[当前状态 placeholder]',
      sublabel: '0.21 · 进入目标带',
      breathe: 'strong',
    },
  ],

  targetBand: {
    min: 0,
    max: 0.25,
    label: '目标带 · TARGET BAND ≤ 0.25',
  },
};

// All industries — Phase A only has 教育 enabled
export const INDUSTRIES: Section4ChartData[] = [
  EDUCATION,
  {
    industry: 'health',
    label: '大健康',
    cycleDays: 28,
    enabled: false,
    deviations: [],
    samplings: [],
    placements: [],
    events: [],
    targetBand: { min: 0, max: 0.25, label: '' },
  },
  {
    industry: 'manufacturing',
    label: '制造业',
    cycleDays: 28,
    enabled: false,
    deviations: [],
    samplings: [],
    placements: [],
    events: [],
    targetBand: { min: 0, max: 0.25, label: '' },
  },
  {
    industry: 'beauty',
    label: '美妆',
    cycleDays: 28,
    enabled: false,
    deviations: [],
    samplings: [],
    placements: [],
    events: [],
    targetBand: { min: 0, max: 0.25, label: '' },
  },
];
