'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Shared webhook — same channel as the lock-gate pings. Owner sees:
//   👁️ visit  vs  🔓 unlock success  vs  ❌ unlock fail
const DISCORD_WEBHOOK =
  process.env.NEXT_PUBLIC_DISCORD_WEBHOOK ??
  'https://discord.com/api/webhooks/1508100519447625799/K-DrJUQU5OW6sPPGOuJMczR3uSgbADLW-EWfMNMXCJmSdEx0tPvn6mZdS-PX2bC5FNJm';

export default function PageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!DISCORD_WEBHOOK) return;
    if (!pathname) return;

    // Fire on every pathname change — no session-level de-dup.
    // Refreshes, repeat visits, and back/forward navigation all ping.

    const time = new Date().toLocaleString('zh-CN', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
    });
    const ua = (navigator.userAgent || '').slice(0, 100);
    const ref = document.referrer;
    // Wrap URLs in <…> so Discord doesn't auto-embed link previews.
    const referrer = ref ? `<${ref}>` : 'direct';

    // Cloudflare's trace endpoint echoes the caller's public IP plus rough
    // geo (loc = country, colo = nearest CF datacenter). It's CORS-enabled,
    // so the browser can read it directly — no backend needed. If it fails
    // (offline, blocked, etc.) we still send the visit ping without the IP.
    const fetchClient = async () => {
      try {
        const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
          cache: 'no-store',
        });
        const text = await res.text();
        const get = (k: string) =>
          text.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1] ?? '';
        const ip = get('ip');
        const loc = get('loc');
        const colo = get('colo');
        if (!ip) return '';
        const geo = [loc, colo].filter(Boolean).join('/');
        return geo ? `${ip}（${geo}）` : ip;
      } catch {
        return '';
      }
    };

    (async () => {
      const client = await fetchClient();
      const content =
        `👁️ **访问** \`${pathname}\`\n` +
        `时间（LA）：${time}\n` +
        `来源：${referrer}\n` +
        (client ? `IP：\`${client}\`\n` : '') +
        `UA：\`${ua}\``;

      fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // flags: 4 = SUPPRESS_EMBEDS — belt-and-suspenders alongside the
        // <URL> wrap, ensures no link preview cards appear under pings.
        body: JSON.stringify({ content, flags: 4 }),
        keepalive: true,
      }).catch(() => {});
    })();
  }, [pathname]);

  return null;
}
