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

export interface PostFrontmatter {
  title: string;
  date: string;        // YYYY-MM-DD
  tags?: string[];
  mood?: string;       // mood key 或 label
  weather?: string;    // weather key 或 label
  cover?: string;      // public 下的图片路径，例如 /images/foo.jpg
  excerpt?: string;
  draft?: boolean;
}

export interface Post extends PostFrontmatter {
  slug: string;
  contentHtml: string;
  contentText: string;  // 纯文本，用于搜索索引
  solarTerm: string;    // 节气名
  solarMood: string;    // 节气推荐情绪
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

async function renderMarkdown(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(md);
  return String(file);
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
  const contentHtml = await renderMarkdown(content);
  return {
    slug: fileToSlug(filename),
    title: fm.title || '无题',
    date: fm.date,
    tags: fm.tags || [],
    mood: fm.mood,
    weather: fm.weather,
    cover: fm.cover,
    excerpt: fm.excerpt || stripMarkdown(content).slice(0, 80),
    draft: fm.draft,
    contentHtml,
    contentText: stripMarkdown(content),
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
export async function getOnThisDay(today: Date = new Date()): Promise<PostMeta[]> {
  const posts = await getAllPostMeta();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  return posts.filter(
    (p) => p.month === m && p.day === d && p.year < today.getFullYear()
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
