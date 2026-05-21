import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { formatYMD, formatChineseDate } from '@/lib/paths';
import { getMood, getWeather } from '@/lib/moods';
import { getSolarTermByName } from '@/lib/solarTerms';
import Comments from '@/components/Comments';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: '未找到 · 我的树洞' };
  return { title: `${post.title} · 我的树洞`, description: post.excerpt };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const mood = getMood(post.mood);
  const weather = getWeather(post.weather);
  const term = getSolarTermByName(post.solarTerm);

  return (
    <article className="article">
      <header className="article-head">
        {!post.hideDate && (
          <div className="meta">
            <span>{formatYMD(post.date)}</span>
            <span className="dot">·</span>
            <span>{formatChineseDate(post.date)}</span>
            {mood && (<><span className="dot">·</span><span>{mood.symbol} {mood.label}</span></>)}
            {weather && (<><span className="dot">·</span><span>{weather.symbol} {weather.label}</span></>)}
          </div>
        )}
        <div className="ornament" />
        <h1>{post.title}</h1>
        {term && !post.hideDate && (
          <div className="term-line">
            {term.name} · {term.blurb}
          </div>
        )}
        <div className="ornament" />
      </header>

      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {post.tags && post.tags.length > 0 && (
        <div className="article-tags">
          {post.tags.map((t) => (
            <Link key={t} href={`/tags/${t}/`}>{t}</Link>
          ))}
        </div>
      )}

      <Comments pageId={post.slug} pageTitle={post.title} />

      <nav className="article-nav">
        <Link href="/">← 回到日志</Link>
      </nav>
    </article>
  );
}
