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
