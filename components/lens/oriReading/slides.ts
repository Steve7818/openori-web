export type SlideType = 'cover' | 'platform' | 'ori' | 'cta';

export interface PlatformSlide {
  type: 'platform';
  platformId: 'doubao' | 'deepseek' | 'ernie' | 'qwen' | 'kimi' | 'zhipu';
  brand: string;
  parent: string;
  logo: string;
  source: string;
}

export interface CoverSlide {
  type: 'cover';
  brand: string;
  question: string;
}

export interface OriSlide {
  type: 'ori';
}

export interface CtaSlide {
  type: 'cta';
  dailyRemaining: number;
}

export type Slide = CoverSlide | PlatformSlide | OriSlide | CtaSlide;

/** Section names for top bar center label (1-indexed by page number) */
export const SECTION_NAMES: Record<number, string> = {
  1: 'COVER',
  2: '06 AI \u5e73\u53f0 \u00b7 01',
  3: '06 AI \u5e73\u53f0 \u00b7 02',
  4: '06 AI \u5e73\u53f0 \u00b7 03',
  5: '06 AI \u5e73\u53f0 \u00b7 04',
  6: '06 AI \u5e73\u53f0 \u00b7 05',
  7: '06 AI \u5e73\u53f0 \u00b7 06',
  8: 'FINAL READ \u00b7 BY ORI',
  9: '\u4e0b\u4e00\u6b65',
};

export const PLATFORM_SLIDES: Array<Omit<PlatformSlide, 'type'>> = [
  { platformId: 'kimi',     brand: 'Kimi',        parent: '\u6708\u4e4b\u6697\u9762',     logo: '/logos/kimi.png',     source: 'kimi.ai' },
  { platformId: 'deepseek', brand: 'DeepSeek',    parent: '\u5e7b\u65b9\u91cf\u5316',     logo: '/logos/deepseek.png', source: 'deepseek.com' },
  { platformId: 'ernie',    brand: '\u6587\u5fc3\u4e00\u8a00',    parent: '\u767e\u5ea6',         logo: '/logos/ernie.png',    source: 'yiyan.baidu.com' },
  { platformId: 'qwen',     brand: '\u901a\u4e49\u5343\u95ee',    parent: '\u963f\u91cc',         logo: '/logos/qwen.png',     source: 'tongyi.aliyun.com' },
  { platformId: 'doubao',   brand: '\u8c46\u5305',        parent: '\u5b57\u8282\u8df3\u52a8',     logo: '/logos/doubao.png',   source: 'doubao.com' },
  { platformId: 'zhipu',    brand: '\u667a\u8c31 GLM',    parent: '\u667a\u8c31 AI',     logo: '/logos/zhipu.png',    source: 'chatglm.cn' },
];

export const ORI_SLIDE_META = {
  brand: 'Ori',
  parent: 'OpenOri',
  logo: '/logos/ori.svg',
};
