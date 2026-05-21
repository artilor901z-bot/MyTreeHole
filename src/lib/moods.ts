// 心情与天气 · 用于日志元数据
export interface MoodOption {
  key: string;
  label: string;
  symbol: string; // 文字符号，避免 emoji 破坏文艺感
}

export const MOODS: MoodOption[] = [
  { key: 'serene',   label: '宁静', symbol: '◎' },
  { key: 'joyful',   label: '欢喜', symbol: '✦' },
  { key: 'melancholy', label: '怅惘', symbol: '◐' },
  { key: 'pensive',  label: '沉思', symbol: '◇' },
  { key: 'restless', label: '不安', symbol: '◆' },
  { key: 'tender',   label: '柔软', symbol: '❀' },
  { key: 'lonely',   label: '孤独', symbol: '◯' },
  { key: 'grateful', label: '感念', symbol: '✿' },
  { key: 'tired',    label: '疲惫', symbol: '◑' },
  { key: 'hopeful',  label: '期盼', symbol: '✧' },
];

export function getMood(key?: string | null): MoodOption | undefined {
  if (!key) return undefined;
  return MOODS.find((m) => m.key === key || m.label === key);
}

export interface WeatherOption {
  key: string;
  label: string;
  symbol: string;
}

export const WEATHERS: WeatherOption[] = [
  { key: 'sunny',  label: '晴',   symbol: '☉' },
  { key: 'cloudy', label: '阴',   symbol: '☁' },
  { key: 'rain',   label: '雨',   symbol: '☂' },
  { key: 'snow',   label: '雪',   symbol: '❄' },
  { key: 'wind',   label: '风',   symbol: '≋' },
  { key: 'fog',    label: '雾',   symbol: '〰' },
  { key: 'thunder',label: '雷',   symbol: '⚡' },
  { key: 'night',  label: '夜',   symbol: '☾' },
];

export function getWeather(key?: string | null): WeatherOption | undefined {
  if (!key) return undefined;
  return WEATHERS.find((w) => w.key === key || w.label === key);
}
