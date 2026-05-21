import Link from 'next/link';
import { getAllPostMeta } from '@/lib/posts';
import type { PostMeta } from '@/lib/posts';
import { formatYMD } from '@/lib/paths';

export const metadata = { title: '归档 · 我的树洞' };

export default async function ArchivePage() {
  const posts = await getAllPostMeta();
  const byYear = new Map<number, PostMeta[]>();
  for (const p of posts) {
    const arr = byYear.get(p.year) || [];
    arr.push(p);
    byYear.set(p.year, arr);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <>
      <header className="page-head">
        <div className="eyebrow">archive</div>
        <h1>归档</h1>
        <div className="sub">共 {posts.length} 篇</div>
      </header>

      {years.map((y) => (
        <section key={y} className="year-group">
          <div className="year">{y}</div>
          <ul className="year-list">
            {(byYear.get(y) || []).map((p) => (
              <li key={p.slug}>
                <span className="ymd">{formatYMD(p.date).slice(5)}</span>
                <Link href={`/posts/${p.slug}/`}>{p.title}</Link>
                <span className="tail">{p.solarTerm}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
