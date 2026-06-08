import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

// 「执笔」是写作页，只在本地 dev 时给自己看，部署到线上后不出现在菜单里。
// 这样陌生访客看不到「写」的入口；但页面本身仍然存在（他们就算猜到 URL，
// 写的东西也只在他们自己的浏览器里，不会进入这个博客）。
const NAV = [
  { href: '/',         label: '日志' },
  { href: '/games/',   label: '游戏日志' },
  { href: '/whispers/',label: '悄悄话' },
  { href: '/notes/',   label: '便签' },
  { href: '/archive/', label: '归档' },
  { href: '/tags/',    label: '标签' },
  { href: '/search/',  label: '寻字' },
  ...(process.env.NODE_ENV !== 'production'
    ? [{ href: '/compose/', label: '执笔' }]
    : []),
  { href: '/about/',   label: '关于' },
];

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="dot" />
        我的树洞
        <span className="en">tree hole</span>
      </Link>
      <nav className="site-nav">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href}>{n.label}</Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
