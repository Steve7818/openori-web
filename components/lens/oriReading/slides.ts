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
  2: '06 AI 平台 · 01',
  3: '06 AI 平台 · 02',
  4: '06 AI 平台 · 03',
  5: '06 AI 平台 · 04',
  6: '06 AI 平台 · 05',
  7: '06 AI 平台 · 06',
  8: 'FINAL READ · BY ORI',
  9: '下一步',
};

export const PLATFORM_SLIDES: Array<Omit<PlatformSlide, 'type'>> = [
  { platformId: 'kimi',     brand: 'Kimi',        parent: '月之暗面',     logo: '/logos/kimi.png',     source: 'kimi.ai' },
  { platformId: 'deepseek', brand: 'DeepSeek',    parent: '幻方量化',     logo: '/logos/deepseek.png', source: 'deepseek.com' },
  { platformId: 'ernie',    brand: '文心一言',    parent: '百度',         logo: '/logos/ernie.png',    source: 'yiyan.baidu.com' },
  { platformId: 'qwen',     brand: '通义千问',    parent: '阿里',         logo: '/logos/qwen.png',     source: 'tongyi.aliyun.com' },
  { platformId: 'doubao',   brand: '豆包',        parent: '字节跳动',     logo: '/logos/doubao.png',   source: 'doubao.com' },
  { platformId: 'zhipu',    brand: '智谱 GLM',    parent: '智谱 AI',     logo: '/logos/zhipu.png',    source: 'chatglm.cn' },
];

export const ORI_SLIDE_META = {
  brand: 'Ori',
  parent: 'OpenOri',
  logo: '/logos/ori.svg',
};
