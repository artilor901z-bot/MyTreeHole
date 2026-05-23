import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { getSolarTerm } from './solarTerms';

export type PostCategory = 'journal' | 'game' | 'whisper';

export interface EncryptionParams {
  algorithm: 'aes-256-gcm';
  iterations: number;
  salt: string; // base64
  iv: string;   // base64
}

export interface PostFrontmatter {
  title: string;
  date: string;        // YYYY-MM-DD
  tags?: string[];
  mood?: string;       // mood key 或 label
  weather?: string;    // weather key 或 label
  cover?: string;      // public 下的图片路径，例如 /images/foo.jpg
  excerpt?: string;
  draft?: boolean;
  hideDate?: boolean;  // 不在文章页/卡片显示日期（仍用于排序与节气计算）
  category?: PostCategory; // 'journal' (默认 · 树洞) | 'game' (游戏日志) | 'whisper' (悄悄话 · 加密)
  encrypted?: boolean; // 内容已用 AES-GCM 加密，正文是 base64(ciphertext+tag)
  encryption?: EncryptionParams;
}

export interface Post extends PostFrontmatter {
  slug: string;
  contentHtml: string;     // 加密文章 = 空字符串；明文文章 = 已渲染 HTML
  contentText: string;     // 加密文章 = 空字符串（不进搜索索引）；明文 = 去掉标记的纯文本
  ciphertext?: string;     // base64(ciphertext + GCM tag)，仅加密文章有
  solarTerm: string;
  solarMood: string;
  year: number;
  month: number;
  day: number;
}

export interface PostMeta extends Omit<Post, 'contentHtml' | 'contentText'> {}

const POSTS_DIR = path.join(process.cwd(), 'posts');

function ensureDir(): void {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function listFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
}

function fileToSlug(filename: string): string {
  return filename.replace(/\.(md|mdx)$/i, '');
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

async function renderMarkdown(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(md);
  let html = String(file);
  // 给 markdown 里的根绝对路径 (/images/foo.jpg, /posts/...) 自动加上 basePath
  // 避免部署到 GitHub Project Pages (/MyTreeHole/) 时图片/链接 404
  if (BASE) {
    html = html.replace(/(<img\b[^>]*?\bsrc=)"\/(?!\/)/g, `$1"${BASE}/`);
    html = html.replace(/(<a\b[^>]*?\bhref=)"\/(?!\/)/g, `$1"${BASE}/`);
  }
  return html;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readPost(filename: string): Promise<Post> {
  const filePath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const fm = data as PostFrontmatter;
  const date = new Date(fm.date);
  const term = getSolarTerm(date);
  const isEncrypted = !!fm.encrypted;

  // 加密文章：不渲染、不进搜索索引、不生成摘要
  const contentHtml = isEncrypted ? '' : await renderMarkdown(content);
  const contentText = isEncrypted ? '' : stripMarkdown(content);
  const excerpt = isEncrypted
    ? '🔒 这一篇上了锁'
    : (fm.excerpt || contentText.slice(0, 80));

  return {
    slug: fileToSlug(filename),
    title: fm.title || '无题',
    date: fm.date,
    tags: fm.tags || [],
    mood: fm.mood,
    weather: fm.weather,
    cover: fm.cover,
    excerpt,
    draft: fm.draft,
    hideDate: fm.hideDate,
    category: fm.category || 'journal',
    encrypted: isEncrypted,
    encryption: fm.encryption,
    ciphertext: isEncrypted ? content.trim() : undefined,
    contentHtml,
    contentText,
    solarTerm: term.name,
    solarMood: term.mood,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

let _cache: Post[] | null = null;

export async function getAllPosts(): Promise<Post[]> {
  if (_cache) return _cache;
  const files = listFiles();
  const posts = await Promise.all(files.map(readPost));
  const visible = posts.filter((p) => !p.draft);
  visible.sort((a, b) => (a.date < b.date ? 1 : -1));
  _cache = visible;
  return visible;
}

export async function getAllPostMeta(): Promise<PostMeta[]> {
  const posts = await getAllPosts();
  return posts.map(({ contentHtml: _h, contentText: _t, ...meta }) => meta);
}

export async function getPostMetaByCategory(cat: PostCategory): Promise<PostMeta[]> {
  const all = await getAllPostMeta();
  return all.filter((p) => (p.category || 'journal') === cat);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags || []) map.set(t, (map.get(t) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/** 给定今天的日期，返回历史上同一天/同一节气的旧日志，用作"去年今日" */
export async function getOnThisDay(
  today: Date = new Date(),
  category?: PostCategory
): Promise<PostMeta[]> {
  const posts = await getAllPostMeta();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  return posts.filter(
    (p) =>
      p.month === m &&
      p.day === d &&
      p.year < today.getFullYear() &&
      (!category || (p.category || 'journal') === category)
  );
}

/** 提供给搜索页的极简索引 */
export interface SearchEntry {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  text: string;
  tags: string[];
}

export async function getSearchIndex(): Promise<SearchEntry[]> {
  const posts = await getAllPosts();
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt || '',
    text: p.contentText,
    tags: p.tags || [],
  }));
}
