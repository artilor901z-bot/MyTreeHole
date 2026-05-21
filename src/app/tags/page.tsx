import Link from 'next/link';
import { getAllTags } from '@/lib/posts';

export const metadata = { title: '标签 · 我的树洞' };

export default async function TagsPage() {
  const tags = await getAllTags();
  return (
    <>
      <header className="page-head">
        <div className="eyebrow">tags</div>
        <h1>标签</h1>
        <div className="sub">{tags.length} 枚</div>
      </header>

      {tags.length === 0 ? (
        <div className="empty"><p>还没有标签。</p></div>
      ) : (
        <div className="tag-cloud">
          {tags.map((t) => (
            <Link
              key={t.tag}
              href={`/tags/${t.tag}/`}
              style={{ fontSize: 16 + Math.min(t.count, 10) * 2 }}
            >
              #{t.tag}
              <span className="cnt">{t.count}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
