'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { withBase } from '@/lib/paths';

interface Entry {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  text: string;
  tags: string[];
}

function highlight(text: string, q: string): string {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text.slice(0, 120);
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + q.length + 80);
  const segment = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return segment.replace(re, '<mark>$1</mark>');
}

function fmtDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '.');
}

export default function SearchClient() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(withBase('/search-index.json'))
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const k = q.trim().toLowerCase();
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(k) ||
        e.text.toLowerCase().includes(k) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(k))
    );
  }, [q, entries]);

  return (
    <div>
      <input
        autoFocus
        placeholder="输入关键字，例如 雨、孤独、母亲…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>
        {loading
          ? '正在加载索引…'
          : q
          ? `找到 ${results.length} 篇`
          : `共有 ${entries.length} 篇可检索`}
      </div>

      <div className="post-list" style={{ marginTop: 24 }}>
        {results.map((r) => (
          <article key={r.slug} className="post-row">
            <Link href={`/posts/${r.slug}/`} className="row-link">
              <div className="meta">
                <span>{fmtDate(r.date)}</span>
                {r.tags.map((t) => (
                  <span key={t} className="dot">·</span>
                ))}
              </div>
              <h2 className="title" dangerouslySetInnerHTML={{ __html: highlight(r.title, q) }} />
              <p className="excerpt" dangerouslySetInnerHTML={{ __html: highlight(r.text, q) }} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
