'use client';

import { useEffect, useState } from 'react';
import type { EncryptionParams } from '@/lib/posts';

interface Props {
  slug: string;
  ciphertext: string;
  encryption: EncryptionParams;
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function decryptHtml(
  password: string,
  ciphertextB64: string,
  enc: EncryptionParams
): Promise<string> {
  const salt = fromB64(enc.salt);
  const iv = fromB64(enc.iv);
  const ctWithTag = fromB64(ciphertextB64);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: enc.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    ctWithTag as unknown as BufferSource
  );
  return new TextDecoder().decode(plainBuf);
}

const STORAGE_KEY = (slug: string) => `whisper-pwd:${slug}`;

// Owner-only ping: notifies a Discord channel when someone tries the password.
// Override via env: NEXT_PUBLIC_DISCORD_WEBHOOK=''  disables pings entirely.
const DISCORD_WEBHOOK =
  process.env.NEXT_PUBLIC_DISCORD_WEBHOOK ??
  'https://discord.com/api/webhooks/1508100519447625799/K-DrJUQU5OW6sPPGOuJMczR3uSgbADLW-EWfMNMXCJmSdEx0tPvn6mZdS-PX2bC5FNJm';

function pingUnlock(slug: string, success: boolean) {
  if (!DISCORD_WEBHOOK) return;
  try {
    const time = new Date().toLocaleString('zh-CN', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
    });
    const ua = (navigator.userAgent || '').slice(0, 100);
    const emoji = success ? '🔓' : '❌';
    const status = success ? '解锁成功' : '密码错误';
    const content = `${emoji} **${status}** · \`${slug}\`\n时间（LA）：${time}\nUA：\`${ua}\``;
    // Fire-and-forget; keepalive lets the request complete even if the page
    // is being unloaded immediately after.
    fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // flags: 4 = SUPPRESS_EMBEDS — no auto link previews in Discord
      body: JSON.stringify({ content, flags: 4 }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* silent */
  }
}

export default function EncryptedPost({ slug, ciphertext, encryption }: Props) {
  const [password, setPassword] = useState('');
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 本次会话内尝试用记住的密码自动解锁
  useEffect(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY(slug));
    if (!cached) return;
    decryptHtml(cached, ciphertext, encryption)
      .then((h) => setHtml(h))
      .catch(() => sessionStorage.removeItem(STORAGE_KEY(slug)));
  }, [slug, ciphertext, encryption]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const h = await decryptHtml(password, ciphertext, encryption);
      setHtml(h);
      sessionStorage.setItem(STORAGE_KEY(slug), password);
      pingUnlock(slug, true);
    } catch {
      setError('密码不对。再试试？');
      pingUnlock(slug, false);
    } finally {
      setBusy(false);
    }
  }

  if (html !== null) {
    return (
      <>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.2em' }}>
          —— 阅毕，可关闭此页 ——
        </div>
      </>
    );
  }

  return (
    <section className="lock-gate">
      <div className="lock-icon">◐</div>
      <p className="lock-hint">这一篇上了锁。</p>
      <p className="lock-sub">如果你是它要写给的人，你会知道密码的。</p>
      <p className="lock-warn">
        读之前，
        <br />
        请先让自己安静一点。
        <br />
        不急——慢慢来。
      </p>
      <form onSubmit={submit}>
        <input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          maxLength={4}
          placeholder="四位密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn" disabled={busy || password.length === 0}>
          {busy ? '解锁中…' : '解锁'}
        </button>
        {error && <p className="lock-error">{error}</p>}
      </form>
    </section>
  );
}
