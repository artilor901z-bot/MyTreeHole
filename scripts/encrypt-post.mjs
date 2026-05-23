#!/usr/bin/env node
/**
 * 把 posts-secret/<file>.md 的明文加密，输出到 posts/<file>.md
 *
 * 用法：
 *   node scripts/encrypt-post.mjs posts-secret/2026-05-23-letter.md 0106
 *
 * 加密方案：
 *   - 内容先经 markdown → HTML 渲染（与公开文章一致），再加密
 *     这样浏览器解锁后无需打包 markdown 解析器
 *   - PBKDF2-SHA256 (200000 轮) 从密码派生 256 位 key
 *   - AES-256-GCM 加密 HTML，密文 || tag 拼接后 base64
 *   - 盐、IV、迭代次数写入 frontmatter
 *
 * 4 位数字密码理论上可被 10000 次尝试穷举。PBKDF2 慢哈希拉长每次尝试时间到 50ms+，
 * 真正"懒人级"暴破也要几分钟以上。如果是高价值内容，请用 6 位以上 + 字母。
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

const ITERATIONS = 200000;
// Default basePath for the GH Pages deployment. Hardcoded here to dodge
// Git Bash's MSYS path conversion (a leading "/" env-var becomes a Windows
// path on Windows shells, which broke <img src=…> baked into ciphertext).
// Override via env when needed:  NEXT_PUBLIC_BASE_PATH='' for root deploys.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '/MyTreeHole';

async function renderMarkdown(md) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(md);
  let html = String(file);
  // 与 src/lib/posts.ts 一致：给根绝对路径补 basePath
  // （加密文章构建时 basePath 通常为空；这里保留兼容）
  if (BASE) {
    html = html.replace(/(<img\b[^>]*?\bsrc=)"\/(?!\/)/g, `$1"${BASE}/`);
    html = html.replace(/(<a\b[^>]*?\bhref=)"\/(?!\/)/g, `$1"${BASE}/`);
  }
  return html;
}

async function main() {
  const [, , srcArg, password] = process.argv;
  if (!srcArg || !password) {
    console.error('Usage: node scripts/encrypt-post.mjs <posts-secret/file.md> <password>');
    process.exit(1);
  }

  const srcPath = path.resolve(srcArg);
  if (!fs.existsSync(srcPath)) {
    console.error(`Source not found: ${srcPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(srcPath, 'utf8');
  const { data, content } = matter(raw);

  // 渲染 markdown → HTML
  const html = await renderMarkdown(content);

  // 派生密钥 + 加密
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(html, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const blob = Buffer.concat([ct, tag]).toString('base64');

  // 写出加密 .md 到 posts/
  const outName = path.basename(srcPath);
  const outPath = path.join(process.cwd(), 'posts', outName);
  const newData = {
    ...data,
    encrypted: true,
    encryption: {
      algorithm: 'aes-256-gcm',
      iterations: ITERATIONS,
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
    },
  };
  fs.writeFileSync(outPath, matter.stringify(blob + '\n', newData), 'utf8');

  console.log(`Encrypted ${srcPath}`);
  console.log(`  → ${outPath}`);
  console.log(`  bytes plaintext html: ${html.length}, ciphertext (b64): ${blob.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
