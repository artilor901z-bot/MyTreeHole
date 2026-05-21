import Link from 'next/link';
import { getAllPostMeta, getOnThisDay } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import TodayBlock from '@/components/TodayBlock';
import ExportButton from '@/components/ExportButton';

export default async function Home() {
  const [posts, onThisDay] = await Promise.all([
    getAllPostMeta(),
    getOnThisDay(),
  ]);
  const recent = posts.slice(0, 10);

  return (
    <>
      <TodayBlock />
      <div className="today-divider" />

      {posts.length === 0 ? (
        <div className="empty">
          <p>这里还很安静。</p>
          <p style={{ marginTop: 14 }}>
            去 <Link href="/compose/">执笔</Link>，写下今日的第一句话。
          </p>
        </div>
      ) : (
        <div className="post-list">
          {recent.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}

      {posts.length > recent.length && (
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/archive/" className="btn">查看全部 →</Link>
        </div>
      )}

      {onThisDay.length > 0 && (
        <section style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid var(--line-soft)' }}>
          <div className="page-head" style={{ padding: '0 0 24px' }}>
            <div className="eyebrow">on this day</div>
            <h1 style={{ fontSize: 22 }}>去年今日</h1>
          </div>
          <div className="post-list">
            {onThisDay.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <div style={{ textAlign: 'center', marginTop: 60, fontSize: 13, color: 'var(--ink-3)' }}>
        <ExportButton />
      </div>
    </>
  );
}
