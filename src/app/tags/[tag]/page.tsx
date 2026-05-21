import { getAllPostMeta, getAllTags } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export async function generateStaticParams() {
  const tags = await getAllTags();
  // 传原始中文，让 Next.js 自己处理 URL 编码；预编码会让磁盘上的目录名
  // 和实际请求路径不一致，GH Pages 在 URL-decode 后找不到文件 → 404
  return tags.map((t) => ({ tag: t.tag }));
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
