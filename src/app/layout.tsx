import type { Metadata } from 'next';
import { Noto_Serif_SC, EB_Garamond } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageView from '@/components/PageView';
import SiteLock from '@/components/SiteLock';
import './globals.css';

const serifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-serif-sc',
  display: 'swap',
});

const serifLatin = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif-latin',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '我的树洞 · My Tree Hole',
  description: '一处安放情绪与思绪的小角落。',
};

// 在 React 接管前先把主题写进 <html> 上，避免页面闪一下白
const themeBootstrap = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (!t) {
      t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = t;
  } catch (_) {}
})();
`;

// 同理，在首帧之前就把门锁挂上，本次会话没解锁过就看不到内容闪现。
// 解锁状态只放 sessionStorage，每次新开站点都要重输；解锁后由 SiteLock 摘掉 data-locked。
const lockBootstrap = `
(function() {
  try {
    if (sessionStorage.getItem('site-unlocked') !== '1') {
      document.documentElement.dataset.locked = '1';
    }
  } catch (_) {
    document.documentElement.dataset.locked = '1';
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${serifSC.variable} ${serifLatin.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <script dangerouslySetInnerHTML={{ __html: lockBootstrap }} />
      </head>
      <body>
        <SiteLock />
        <div className="shell">
          <Header />
          <main className="main">{children}</main>
          <Footer />
        </div>
        <PageView />
      </body>
    </html>
  );
}
