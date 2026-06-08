import NoteBoard from '@/components/NoteBoard';

export const metadata = { title: '便签 · 我的树洞' };

export default function NotesPage() {
  return (
    <>
      <header className="page-head">
        <div className="eyebrow">notes</div>
        <h1>便签</h1>
        <div className="sub">
          路过的人都可以贴一张。一句感慨、一个念头、一个 idea，50 字以内。
        </div>
      </header>

      <NoteBoard />
    </>
  );
}
