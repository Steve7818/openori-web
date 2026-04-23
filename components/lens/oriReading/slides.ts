export type SlideType = 'cover' | 'platform' | 'ori' | 'cta';

export interface PlatformSlide {
  type: 'platform';
  platformId: 'doubao' | 'deepseek' | 'ernie' | 'qwen' | 'kimi' | 'zhipu';
  brand: string;
  parent: string;
  logo: string;
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

export const PLATFORM_SLIDES: Array<Omit<PlatformSlide, 'type'>> = [
  { platformId: 'kimi',     brand: 'Kimi',        parent: '月之暗面',   logo: '/logos/kimi.png' },
  { platformId: 'deepseek', brand: 'DeepSeek',    parent: 'DeepSeek',   logo: '/logos/deepseek.png' },
  { platformId: 'ernie',    brand: '文心一言',    parent: '百度',       logo: '/logos/ernie.png' },
  { platformId: 'qwen',     brand: '千问',        parent: '阿里',       logo: '/logos/qwen.png' },
  { platformId: 'doubao',   brand: '豆包',        parent: '字节跳动',   logo: '/logos/doubao.png' },
  { platformId: 'zhipu',    brand: '智谱',        parent: '智谱 AI',    logo: '/logos/zhipu.png' },
];

export const ORI_SLIDE_META = {
  brand: 'Ori',
  parent: 'OpenOri',
  logo: '/logos/ori.svg',
};
