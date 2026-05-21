import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

const NAV = [
  { href: '/',         label: '日志' },
  { href: '/archive/', label: '归档' },
  { href: '/tags/',    label: '标签' },
  { href: '/search/',  label: '寻字' },
  { href: '/compose/', label: '执笔' },
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
