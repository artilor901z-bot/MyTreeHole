import type { Metadata } from 'next';
import { Noto_Serif_SC, EB_Garamond } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${serifSC.variable} ${serifLatin.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <div className="shell">
          <Header />
          <main className="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
