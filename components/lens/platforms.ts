/**
 * Platform metadata for GEO Lens
 */

export interface Platform {
  id: string;
  name: string;
  logo: string;
  logoBg: string;
}

export const PLATFORMS: Platform[] = [
  { id: 'deepseek', name: 'DeepSeek', logo: 'DS', logoBg: '#4D6BFE' },
  { id: 'kimi', name: 'Kimi', logo: 'K', logoBg: '#1F1F22' },
  { id: 'qwen', name: '通义千问', logo: '千', logoBg: '#5F5FDD' },
  { id: 'zhipu', name: '智谱 GLM', logo: '智', logoBg: '#2B7FFF' },
  { id: 'ernie', name: '文心一言', logo: '文', logoBg: '#E62E5C' },
  { id: 'doubao', name: '豆包', logo: '豆', logoBg: '#4A90E2' },
];

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find(p => p.id === id);
}
