import SearchClient from '@/components/SearchClient';

export const metadata = { title: '寻字 · 我的树洞' };

export default function SearchPage() {
  return (
    <>
      <header className="page-head">
        <div className="eyebrow">search</div>
        <h1>寻字</h1>
        <div className="sub">在过往的日志中检索</div>
      </header>
      <SearchClient />
    </>
  );
}
