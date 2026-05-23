import Link from 'next/link';
import { getPostMetaByCategory } from '@/lib/posts';
import { formatYMD } from '@/lib/paths';

export const metadata = { title: '悄悄话 · 我的树洞' };

export default async function WhispersPage() {
  const posts = await getPostMetaByCategory('whisper');

  return (
    <>
      <header className="page-head">
        <div className="eyebrow">whispers</div>
        <h1>悄悄话</h1>
        <div className="sub">
          {posts.length > 0
            ? `${posts.length} 篇 · 上锁的、写给某个人的话`
            : '上锁的、写给某个人的话'}
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="empty">
          <p>这里还很静。</p>
        </div>
      ) : (
        <ul className="post-list" style={{ listStyle: 'none' }}>
          {posts.map((p) => (
            <li key={p.slug} className="post-row">
              <Link href={`/posts/${p.slug}/`} className="row-link">
                <div className="meta">
                  <span style={{ color: 'var(--accent)' }}>◐</span>
                  <span className="dot">·</span>
                  <span>{formatYMD(p.date)}</span>
                </div>
                <h2 className="title">{p.title}</h2>
                <p className="excerpt" style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>
                  这一篇上了锁。
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
