// 包装 next.config 里的 basePath，方便在客户端组件里拼图片/链接
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function withBase(p: string): string {
  if (!p) return BASE || '/';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/')) return `${BASE}${p}`;
  return `${BASE}/${p}`;
}

export function formatChineseDate(iso: string): string {
  const d = new Date(iso);
  const cn = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  const dayCn: Record<number, string> = {
    1: '初一', 2: '初二', 3: '初三', 4: '初四', 5: '初五', 6: '初六', 7: '初七',
    8: '初八', 9: '初九', 10: '初十', 11: '十一', 12: '十二', 13: '十三', 14: '十四',
    15: '十五', 16: '十六', 17: '十七', 18: '十八', 19: '十九', 20: '二十',
    21: '廿一', 22: '廿二', 23: '廿三', 24: '廿四', 25: '廿五', 26: '廿六',
    27: '廿七', 28: '廿八', 29: '廿九', 30: '三十', 31: '三十一',
  };
  return `${cn[d.getMonth()]}月${dayCn[d.getDate()] || d.getDate()}日`;
}

export function formatYMD(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${m}.${day}`;
}
