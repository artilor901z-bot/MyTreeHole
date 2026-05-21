import { getAllPostMeta, getAllTags } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: encodeURIComponent(t.tag) }));
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const all = await getAllPostMeta();
  const posts = all.filter((p) => (p.tags || []).includes(tag));

  return (
    <>
      <header className="page-head">
        <div className="eyebrow">tag</div>
        <h1>#{tag}</h1>
        <div className="sub">{posts.length} 篇</div>
      </header>
      <div className="post-list">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </>
  );
}
