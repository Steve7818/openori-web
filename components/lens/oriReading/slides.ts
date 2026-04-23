export type SlideType = 'cover' | 'platform' | 'ori' | 'cta';

export interface PlatformSlide {
  type: 'platform';
  platformId: 'doubao' | 'deepseek' | 'ernie' | 'qwen' | 'kimi' | 'zhipu';
  brand: string;
  sub: string;
  oriNote: string;
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
  { platformId: 'kimi', brand: 'Kimi', sub: '最快返回 · 位次 #3', oriNote: '她把你们放第三位 —— 提到了,但不是她的首推。' },
  { platformId: 'deepseek', brand: 'DeepSeek', sub: '回答最详细 · 位次 #2', oriNote: '首推你们,但标签反复锁在"核心优势"上了。' },
  { platformId: 'ernie', brand: '文心一言', sub: '位次变化', oriNote: '排第一 —— 但场景被限定得很窄。' },
  { platformId: 'qwen', brand: '千问', sub: '位次 #2', oriNote: '这个定位标签,可能不是你想要的。' },
  { platformId: 'doubao', brand: '豆包', sub: '回答最慢 · 位次 #2', oriNote: '"音质"这格,对手把你们挤出去了。' },
  { platformId: 'zhipu', brand: '智谱', sub: '回答最短 · 位次 #1', oriNote: '排第一 —— 但重复了已有的标签模式。' },
];
