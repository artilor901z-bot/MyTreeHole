// 站长通知：访问 / 解锁 / 便签举报 都 ping 到同一个 Discord 频道。
//
// webhook 地址不再写进源码。公开仓库里一出现，Discord 的扫描器几小时内
// 就会把它作废（2026-09 那次就是这么没的）。地址只从构建时环境变量注入：
//   - GitHub Actions：仓库 Secret `DISCORD_WEBHOOK` → deploy.yml 里映射成
//     NEXT_PUBLIC_DISCORD_WEBHOOK
//   - 本地开发：.env.local 里写 NEXT_PUBLIC_DISCORD_WEBHOOK=…（已 gitignore）
// 没配就静默不发，站点其他功能不受影响。
//
// 注意：静态站点，地址最终还是会打进浏览器端 JS。扫描器只查 GitHub 仓库，
// 但真要藏住得走一层代理（如 Cloudflare Worker）。
export const DISCORD_WEBHOOK = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK ?? '';

export function pingDiscord(content: string) {
  if (!DISCORD_WEBHOOK) return;
  try {
    // 发出去就不管了；keepalive 让页面马上卸载时请求也能发完。
    // flags: 4 = SUPPRESS_EMBEDS，Discord 不给链接生成预览卡片。
    fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, flags: 4 }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* silent */
  }
}
