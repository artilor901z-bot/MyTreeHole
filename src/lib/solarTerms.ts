// 二十四节气 · 含每节气的情绪基调建议
// 算法：基于 1900 年起每节气固定积日的近似公式，对 1900-2099 年误差 ±1 日

export interface SolarTerm {
  name: string;
  pinyin: string;
  mood: string;
  blurb: string;
}

export const SOLAR_TERMS: SolarTerm[] = [
  { name: '立春', pinyin: 'Lichun',   mood: '新生',  blurb: '春之始，万物初醒' },
  { name: '雨水', pinyin: 'Yushui',   mood: '润泽',  blurb: '细雨润物，思绪初长' },
  { name: '惊蛰', pinyin: 'Jingzhe',  mood: '萌动',  blurb: '春雷乍响，蛰虫苏醒' },
  { name: '春分', pinyin: 'Chunfen',  mood: '澄明',  blurb: '昼夜均分，万象明媚' },
  { name: '清明', pinyin: 'Qingming', mood: '怀想',  blurb: '气清景明，慎终追远' },
  { name: '谷雨', pinyin: 'Guyu',     mood: '滋养',  blurb: '雨生百谷，静水流深' },
  { name: '立夏', pinyin: 'Lixia',    mood: '蓬勃',  blurb: '夏之始，绿意正盛' },
  { name: '小满', pinyin: 'Xiaoman',  mood: '充盈',  blurb: '将满未满，恰是好时' },
  { name: '芒种', pinyin: 'Mangzhong',mood: '充实',  blurb: '麦熟禾忙，亦收亦种' },
  { name: '夏至', pinyin: 'Xiazhi',   mood: '炽烈',  blurb: '日长之极，阳气盛极' },
  { name: '小暑', pinyin: 'Xiaoshu',  mood: '蝉鸣',  blurb: '暑气初临，蝉声满林' },
  { name: '大暑', pinyin: 'Dashu',    mood: '沉静',  blurb: '酷热之中，静守清凉' },
  { name: '立秋', pinyin: 'Liqiu',    mood: '怅然',  blurb: '秋之始，凉风初起' },
  { name: '处暑', pinyin: 'Chushu',   mood: '释然',  blurb: '暑气将退，心渐安定' },
  { name: '白露', pinyin: 'Bailu',    mood: '清明',  blurb: '露凝为珠，天高云淡' },
  { name: '秋分', pinyin: 'Qiufen',   mood: '收敛',  blurb: '昼夜再分，沉思自省' },
  { name: '寒露', pinyin: 'Hanlu',    mood: '怀想',  blurb: '寒意渐深，思故念远' },
  { name: '霜降', pinyin: 'Shuangjiang', mood: '沉淀', blurb: '草木摇落，万物沉静' },
  { name: '立冬', pinyin: 'Lidong',   mood: '内省',  blurb: '冬之始，万物归藏' },
  { name: '小雪', pinyin: 'Xiaoxue',  mood: '缄默',  blurb: '雪意初萌，天地缄默' },
  { name: '大雪', pinyin: 'Daxue',    mood: '厚重',  blurb: '大雪封山，天地浑然' },
  { name: '冬至', pinyin: 'Dongzhi',  mood: '暖意',  blurb: '夜最长，光将回返' },
  { name: '小寒', pinyin: 'Xiaohan',  mood: '守望',  blurb: '寒至未极，静守春信' },
  { name: '大寒', pinyin: 'Dahan',    mood: '期盼',  blurb: '最寒之时，春不远矣' },
];

// 节气积日公式系数（21 世纪适用，C0_20）
// 公式：D = floor(Y * 0.2422 + C) - L，Y = 末两位，L = 闰年修正
const TERM_BASE_DATA: { month: number; c20: number; c21: number }[] = [
  { month: 2,  c20: 4.6295,  c21: 3.87 },    // 立春
  { month: 2,  c20: 19.4599, c21: 18.73 },   // 雨水
  { month: 3,  c20: 6.3826,  c21: 5.63 },    // 惊蛰
  { month: 3,  c20: 21.4155, c21: 20.646 },  // 春分
  { month: 4,  c20: 5.59,    c21: 4.81 },    // 清明
  { month: 4,  c20: 20.888,  c21: 20.1 },    // 谷雨
  { month: 5,  c20: 6.318,   c21: 5.52 },    // 立夏
  { month: 5,  c20: 21.86,   c21: 21.04 },   // 小满
  { month: 6,  c20: 6.5,     c21: 5.678 },   // 芒种
  { month: 6,  c20: 22.20,   c21: 21.37 },   // 夏至
  { month: 7,  c20: 7.928,   c21: 7.108 },   // 小暑
  { month: 7,  c20: 23.65,   c21: 22.83 },   // 大暑
  { month: 8,  c20: 8.35,    c21: 7.5 },     // 立秋
  { month: 8,  c20: 23.95,   c21: 23.13 },   // 处暑
  { month: 9,  c20: 8.44,    c21: 7.646 },   // 白露
  { month: 9,  c20: 23.822,  c21: 23.042 },  // 秋分
  { month: 10, c20: 9.098,   c21: 8.318 },   // 寒露
  { month: 10, c20: 24.218,  c21: 23.438 },  // 霜降
  { month: 11, c20: 8.218,   c21: 7.438 },   // 立冬
  { month: 11, c20: 23.08,   c21: 22.36 },   // 小雪
  { month: 12, c20: 7.9,     c21: 7.18 },    // 大雪
  { month: 12, c20: 22.6,    c21: 21.94 },   // 冬至
  { month: 1,  c20: 6.11,    c21: 5.4055 },  // 小寒（次年）
  { month: 1,  c20: 20.84,   c21: 20.12 },   // 大寒（次年）
];

function termDay(termIdx: number, year: number): number {
  // 小寒/大寒在公历次年 1 月，仍以同一公历年的系数计算
  const data = TERM_BASE_DATA[termIdx];
  const Y = year % 100;
  const c = year >= 2000 ? data.c21 : data.c20;
  // 闰年修正：对春分以后的节气，闰年要减 1
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  let L = 0;
  if (data.month >= 3 || termIdx >= 22) {
    L = Math.floor(((Y - 1) / 4));
  } else {
    L = Math.floor(Y / 4);
  }
  return Math.floor(Y * 0.2422 + c) - L;
}

interface DatedTerm extends SolarTerm {
  date: Date;
}

function termsInYear(year: number): DatedTerm[] {
  return SOLAR_TERMS.map((t, i) => {
    const meta = TERM_BASE_DATA[i];
    const day = termDay(i, year);
    const month = meta.month - 1; // JS month is 0-indexed
    return { ...t, date: new Date(year, month, day) };
  });
}

/** 返回 date 所处节气（最近一次已发生的节气） */
export function getSolarTerm(date: Date): SolarTerm {
  const y = date.getFullYear();
  // 取本年 + 去年最后一个节气，以处理元旦~小寒之间的情况
  const prev = termsInYear(y - 1);
  const curr = termsInYear(y);
  // 按日期排序后再筛，避免数组顺序与日期不一致（小寒/大寒落在公历 1 月）
  const all = [...prev, ...curr]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter((t) => t.date.getTime() <= date.getTime());
  const last = all[all.length - 1] || curr[0];
  return last;
}

export function getSolarTermByName(name: string): SolarTerm | undefined {
  return SOLAR_TERMS.find((t) => t.name === name);
}
