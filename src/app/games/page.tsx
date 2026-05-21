import Link from 'next/link';
import { getPostMetaByCategory } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export const metadata = { title: '游戏日志 · 我的树洞' };

export default async function GamesPage() {
  const posts = await getPostMetaByCategory('game');

  return (
    <>
      <header className="page-head">
        <div className="eyebrow">game log</div>
        <h1>游戏日志</h1>
        <div className="sub">
          {posts.length > 0
            ? `${posts.length} 篇 · 关于玩过的、做过的、想过的游戏`
            : '关于玩过的、做过的、想过的游戏'}
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="empty">
          <p>这里还很空。</p>
          <p style={{ marginTop: 14 }}>
            在 <Link href="/compose/">执笔</Link> 写文章时，
            把「类型」选成「游戏日志」就会出现在这里。
          </p>
        </div>
      ) : (
        <div className="post-list">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </>
  );
}
