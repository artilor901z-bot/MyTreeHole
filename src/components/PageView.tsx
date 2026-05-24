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

    // De-dupe per session: a refresh of the same page within one
    // session doesn't re-fire. Navigating to a different page does.
    const key = `pageview:${pathname}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* sessionStorage may be unavailable; still ping */
    }

    const time = new Date().toLocaleString('zh-CN', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
    });
    const ua = (navigator.userAgent || '').slice(0, 100);
    const ref = document.referrer;
    // Wrap URLs in <…> so Discord doesn't auto-embed link previews.
    const referrer = ref ? `<${ref}>` : 'direct';
    const content =
      `👁️ **访问** \`${pathname}\`\n` +
      `时间（LA）：${time}\n` +
      `来源：${referrer}\n` +
      `UA：\`${ua}\``;

    fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // flags: 4 = SUPPRESS_EMBEDS — belt-and-suspenders alongside the
      // <URL> wrap, ensures no link preview cards appear under pings.
      body: JSON.stringify({ content, flags: 4 }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
