'use client';

import { useEffect, useMemo, useState } from 'react';
import { MOODS, WEATHERS } from '@/lib/moods';
import { getSolarTerm } from '@/lib/solarTerms';

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function slugify(title: string, date: string): string {
  const safe = title
    .trim()
    .replace(/[\s\/\\?#&%]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${date}-${safe || 'entry'}`;
}

// 极简 Markdown 预览：标题、段落、引用、列表、加粗/斜体、链接、图片
function renderPreview(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html
    .split(/\n{2,}/)
    .map((para) => {
      if (/^<(h\d|blockquote|img|ul|ol)/.test(para.trim())) return para;
      return `<p>${para.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');
  return html;
}

export default function ComposeClient() {
  const [date, setDate] = useState(today());
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'journal' | 'game'>('journal');
  const [mood, setMood] = useState('');
  const [weather, setWeather] = useState('');
  const [tags, setTags] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<{ name: string; data: string }[]>([]);

  const term = useMemo(() => {
    try {
      return getSolarTerm(new Date(date));
    } catch {
      return null;
    }
  }, [date]);

  // 自动保存到 localStorage，防止意外丢稿
  useEffect(() => {
    const raw = localStorage.getItem('compose-draft');
    if (raw) {
      try {
        const d = JSON.parse(raw);
        setDate(d.date || today());
        setTitle(d.title || '');
        setCategory(d.category === 'game' ? 'game' : 'journal');
        setMood(d.mood || '');
        setWeather(d.weather || '');
        setTags(d.tags || '');
        setBody(d.body || '');
      } catch {/* ignore */}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'compose-draft',
      JSON.stringify({ date, title, category, mood, weather, tags, body })
    );
  }, [date, title, category, mood, weather, tags, body]);

  const frontmatter = useMemo(() => {
    const tagList = tags
      .split(/[,\s，、]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const lines = ['---', `title: ${title || '无题'}`, `date: ${date}`];
    if (category === 'game') lines.push(`category: game`);
    if (tagList.length) lines.push(`tags: [${tagList.map((t) => `"${t}"`).join(', ')}]`);
    if (mood) lines.push(`mood: ${mood}`);
    if (weather) lines.push(`weather: ${weather}`);
    lines.push('---', '');
    return lines.join('\n');
  }, [title, date, category, tags, mood, weather]);

  const fullMd = frontmatter + (body || '');
  const previewHtml = useMemo(() => renderPreview(body), [body]);

  function download() {
    const slug = slugify(title || '无题', date);
    const blob = new Blob([fullMd], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearDraft() {
    if (!confirm('确定清空当前草稿？')) return;
    setTitle('');
    setMood('');
    setWeather('');
    setTags('');
    setBody('');
  }

  function onAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = String(reader.result);
        setImages((arr) => [...arr, { name: f.name, data }]);
        // 在正文末尾插入图片 markdown，使用相对 /images/ 路径占位
        setBody((b) => `${b}\n\n![${f.name}](/images/${f.name})\n`);
      };
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  }

  return (
    <div>
      <div className="compose-tip">
        <strong>使用说明 ·</strong>{' '}
        在此写完后，点「下载 .md」把文件放进项目的 <code>posts/</code> 目录；
        若有图片，把它们放进 <code>public/images/</code>。
        然后 <code>git push</code>，GitHub Pages 会自动重新构建。
      </div>

      <div style={{ marginBottom: 18 }}>
        <label>类型</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {([
            { v: 'journal', label: '日志（树洞）' },
            { v: 'game',    label: '游戏日志' },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setCategory(opt.v)}
              style={{
                padding: '8px 16px',
                border: '1px solid',
                borderColor: category === opt.v ? 'var(--accent)' : 'var(--line)',
                color: category === opt.v ? 'var(--accent)' : 'var(--ink-2)',
                background: category === opt.v ? 'var(--accent-soft)' : 'transparent',
                fontFamily: 'inherit',
                fontSize: 13,
                cursor: 'pointer',
                letterSpacing: '0.1em',
                transition: 'all 0.18s var(--ease)',
                flex: 1,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="compose-row two">
        <div>
          <label>日期</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {term && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-3)' }}>
              当日节气 · <strong style={{ color: 'var(--accent)' }}>{term.name}</strong> · {term.blurb}
              <button
                type="button"
                className="btn-link"
                style={{ marginLeft: 10, fontSize: 12 }}
                onClick={() => setMood(term.mood)}
              >
                以「{term.mood}」为情绪
              </button>
            </div>
          )}
        </div>
        <div>
          <label>标题</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="今日所思 / on this day" />
        </div>
      </div>

      <div className="compose-row three">
        <div>
          <label>心情</label>
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="">—</option>
            {MOODS.map((m) => (
              <option key={m.key} value={m.label}>{m.symbol} {m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label>天气</label>
          <select value={weather} onChange={(e) => setWeather(e.target.value)}>
            <option value="">—</option>
            {WEATHERS.map((w) => (
              <option key={w.key} value={w.label}>{w.symbol} {w.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label>标签（用逗号、空格分隔）</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="日常, 思考, 雨" />
        </div>
      </div>

      <div className="compose-grid">
        <div>
          <label>正文 · Markdown</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={20}
            placeholder="写下心里那些没处说的话…"
          />
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'inline-block', cursor: 'pointer', margin: 0 }}>
              <input type="file" accept="image/*" multiple onChange={onAddImage} style={{ display: 'none' }} />
              <span className="btn" style={{ fontSize: 12 }}>+ 加入图片</span>
            </label>
            {images.length > 0 && (
              <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--ink-3)' }}>
                已添加 {images.length} 张 · 请将原图复制到 public/images/
              </span>
            )}
          </div>
        </div>

        <div>
          <label>预览</label>
          <div
            className="article-body"
            style={{ padding: '14px 18px', border: '1px solid var(--line)', minHeight: 400, background: 'var(--bg-elev)' }}
            dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:var(--ink-3)">（正文预览）</p>' }}
          />
        </div>
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn accent" onClick={download}>下载 .md ↓</button>
        <button className="btn-link" onClick={clearDraft}>清空草稿</button>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>
          草稿已自动保存在浏览器
        </span>
      </div>

      <details style={{ marginTop: 30 }}>
        <summary style={{ cursor: 'pointer', color: 'var(--ink-3)', fontSize: 13 }}>
          查看完整 Markdown 源码
        </summary>
        <pre style={{ marginTop: 10, padding: 16, background: 'var(--bg-soft)', overflow: 'auto', fontSize: 13 }}>
{fullMd}
        </pre>
      </details>
    </div>
  );
}
