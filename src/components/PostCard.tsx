import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';
import { formatYMD } from '@/lib/paths';
import { getMood, getWeather } from '@/lib/moods';

export default function PostCard({ post }: { post: PostMeta }) {
  const mood = getMood(post.mood);
  const weather = getWeather(post.weather);

  return (
    <article className="post-row">
      <Link href={`/posts/${post.slug}/`} className="row-link">
        <div className="meta">
          {post.category === 'game' && (
            <>
              <span style={{ color: 'var(--accent)', letterSpacing: '0.2em' }}>GAME</span>
              <span className="dot">·</span>
            </>
          )}
          {!post.hideDate && (
            <>
              <span>{formatYMD(post.date)}</span>
              <span className="dot">·</span>
            </>
          )}
          <span>{post.solarTerm}</span>
          {mood && (
            <>
              <span className="dot">·</span>
              <span className="meta-icon">
                <span className="sym">{mood.symbol}</span>
                {mood.label}
              </span>
            </>
          )}
          {weather && (
            <>
              <span className="dot">·</span>
              <span className="meta-icon">
                <span className="sym">{weather.symbol}</span>
                {weather.label}
              </span>
            </>
          )}
        </div>
        <h2 className="title">{post.title}</h2>
        <p className="excerpt">{post.excerpt}</p>
      </Link>

      {post.tags && post.tags.length > 0 && (
        <div className="row-foot">
          {post.tags.map((t) => (
            <Link key={t} href={`/tags/${t}/`} className="tag-chip">
              {t}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
