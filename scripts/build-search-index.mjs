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
      // 加密文章只贡献 title/date 给索引（永不暴露明文/摘要/正文）
      if (data.encrypted) {
        return {
          slug: fileToSlug(file),
          title: data.title || '无题',
          date: data.date,
          tags: data.tags || [],
          mood: null,
          weather: null,
          excerpt: '🔒 这一篇上了锁',
          text: '',
          encrypted: true,
        };
      }
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
    // timestamp-based desc sort — robust against YAML mixing Date/string
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`[search-index] wrote ${entries.length} entries → ${path.relative(process.cwd(), OUT)}`);
}

main();
