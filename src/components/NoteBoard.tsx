'use client';

import { useCallback, useEffect, useState } from 'react';

// Supabase 数据 API：URL + publishable key 都可以安全暴露在前端，
// 真正的访问控制靠数据库里的 RLS 策略（见 README / 部署说明）。
// 可用环境变量覆盖（与项目里 Cusdis / Discord 的写法一致）。
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wzvfdxbhiwljllmgkkns.supabase.co';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  'sb_publishable_1wb_jSL65le31EobGo2w0g_E26rIbJ6';

// 举报复用站点已有的 Discord webhook：访客点「举报」，内容 ping 给站长，
// 站长再去 Supabase 后台删除那一行。
const DISCORD_WEBHOOK =
  process.env.NEXT_PUBLIC_DISCORD_WEBHOOK ??
  'https://discord.com/api/webhooks/1508100519447625799/K-DrJUQU5OW6sPPGOuJMczR3uSgbADLW-EWfMNMXCJmSdEx0tPvn6mZdS-PX2bC5FNJm';

const MAX_CONTENT = 50;
const MAX_NAME = 20;
const COOLDOWN_MS = 20_000; // 同一浏览器两条之间至少隔 20 秒，挡一下手滑和刷屏

interface Note {
  id: string;
  name: string | null;
  content: string;
  created_at: string;
}

const REST = `${SUPABASE_URL}/rest/v1/notes`;
const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function NoteBoard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [reported, setReported] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(
        `${REST}?select=id,name,content,created_at&order=created_at.desc&limit=200`,
        { headers: HEADERS, cache: 'no-store' },
      );
      if (!res.ok) throw new Error(String(res.status));
      setNotes(await res.json());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    if (text.length > MAX_CONTENT) {
      setPostError(`便签最多 ${MAX_CONTENT} 字`);
      return;
    }

    // 软性冷却：纯客户端，挡手滑/连点，不是严格防刷
    try {
      const last = Number(localStorage.getItem('note-last') || '0');
      if (Date.now() - last < COOLDOWN_MS) {
        setPostError('歇一会儿再贴下一张吧～');
        return;
      }
    } catch {}

    setPosting(true);
    setPostError('');
    const trimmedName = name.trim().slice(0, MAX_NAME);
    try {
      const res = await fetch(REST, {
        method: 'POST',
        headers: {
          ...HEADERS,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ name: trimmedName || null, content: text }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const [created] = (await res.json()) as Note[];
      setNotes((prev) => [created, ...prev]);
      setContent('');
      try {
        localStorage.setItem('note-last', String(Date.now()));
      } catch {}
    } catch {
      setPostError('没贴上去，网络好像不太给力，再试一次？');
    } finally {
      setPosting(false);
    }
  }

  function report(n: Note) {
    if (reported.has(n.id)) return;
    if (!window.confirm('确定要举报这张便签吗？会通知站长来处理。')) return;
    setReported((prev) => new Set(prev).add(n.id));
    if (!DISCORD_WEBHOOK) return;
    const body = {
      content:
        `🚩 **便签被举报**\n` +
        `内容：${n.content}\n` +
        `署名：${n.name || '匿名'}\n` +
        `id：\`${n.id}\``,
      flags: 4,
    };
    fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  }

  const remaining = MAX_CONTENT - content.length;

  return (
    <div className="notes">
      <form className="note-compose" onSubmit={submit}>
        <textarea
          className="note-input"
          placeholder="写点什么贴上去……一句感慨、一个念头、一个 idea"
          value={content}
          maxLength={MAX_CONTENT}
          rows={2}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="note-compose-foot">
          <input
            className="note-name"
            placeholder="署名（可留空）"
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
          />
          <span className={`note-count${remaining < 0 ? ' over' : ''}`}>
            {content.length}/{MAX_CONTENT}
          </span>
          <button className="note-submit" type="submit" disabled={posting || !content.trim()}>
            {posting ? '贴上去…' : '贴上去'}
          </button>
        </div>
        {postError && <div className="note-error">{postError}</div>}
      </form>

      {loading ? (
        <div className="empty"><p>正在取下大家的便签……</p></div>
      ) : loadError ? (
        <div className="empty">
          <p>便签墙没加载出来。</p>
          <button className="note-retry" onClick={load}>重试</button>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty"><p>墙上还空着，来贴第一张吧。</p></div>
      ) : (
        <ul className="note-wall">
          {notes.map((n) => (
            <li key={n.id} className="note-card">
              <p className="note-text">{n.content}</p>
              <div className="note-foot">
                <span className="note-by">— {n.name || '匿名'}</span>
                <span className="note-date">{formatDate(n.created_at)}</span>
              </div>
              <button
                className="note-report"
                title="举报"
                onClick={() => report(n)}
                disabled={reported.has(n.id)}
              >
                {reported.has(n.id) ? '已举报' : '举报'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
