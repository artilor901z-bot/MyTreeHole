// 在 next build 之前运行：扫描 posts/，输出 public/search-index.json
// 让搜索与导出按钮可以直接读取静态 JSON。
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'posts');
const OUT = path.join(process.cwd(), 'public', 'search-index.json');

function stripMarkdown(md) {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fileToSlug(name) {
  return name.replace(/\.(md|mdx)$/i, '');
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
  const entries = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      if (data.draft) return null;
      const text = stripMarkdown(content);
      return {
        slug: fileToSlug(file),
        title: data.title || '无题',
        date: data.date,
        tags: data.tags || [],
        mood: data.mood || null,
        weather: data.weather || null,
        excerpt: data.excerpt || text.slice(0, 80),
        text,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`[search-index] wrote ${entries.length} entries → ${path.relative(process.cwd(), OUT)}`);
}

main();
