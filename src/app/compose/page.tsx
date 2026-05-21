import ComposeClient from '@/components/ComposeClient';

export const metadata = { title: '执笔 · 我的树洞' };

export default function ComposePage() {
  return (
    <>
      <header className="page-head">
        <div className="eyebrow">compose</div>
        <h1>执笔</h1>
        <div className="sub">写下今日所思</div>
      </header>
      <ComposeClient />
    </>
  );
}
