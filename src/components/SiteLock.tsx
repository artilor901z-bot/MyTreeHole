'use client';

import { useEffect, useState } from 'react';

// 站点级门锁。密码只以 SHA-256 摘要形式出现在前端，输入后比对摘要。
// 解锁状态只写进 sessionStorage：同一标签页内翻页、刷新不用重输，
// 关掉标签或新开一个窗口再进来就要再输一次。
// 注意：这是静态站点，锁只挡住"随手点进来"的人，源码里的内容仍然可见。
export const SITE_LOCK_KEY = 'site-unlocked';
const PASSWORD_SHA256 = 'd19e5dbfd3d3afe04f12e4f5c12085065e973246970d42608186ab4d20d4a9c5';

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function SiteLock() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 挂载时与 <head> 里的 bootstrap 脚本对齐：已解锁则确保门锁属性被移除
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SITE_LOCK_KEY) === '1') {
        delete document.documentElement.dataset.locked;
      }
    } catch {
      /* sessionStorage 不可用时保持锁住 */
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const digest = await sha256Hex(password);
      if (digest !== PASSWORD_SHA256) {
        setError('密码不对。再试试？');
        setPassword('');
        return;
      }
      try {
        sessionStorage.setItem(SITE_LOCK_KEY, '1');
      } catch {
        /* 记不住就记不住，本次先放进去 */
      }
      delete document.documentElement.dataset.locked;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="site-lock" role="dialog" aria-modal="true" aria-label="输入密码">
      <section className="lock-gate">
        <div className="lock-icon">◐</div>
        <p className="lock-hint">这里上了锁。</p>
        <p className="lock-sub">认识我的人，会知道密码的。</p>
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
            {busy ? '核对中…' : '进入'}
          </button>
          {error && <p className="lock-error">{error}</p>}
        </form>
      </section>
    </div>
  );
}
