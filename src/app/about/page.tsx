import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于 · 我的树洞',
};

export default function About() {
  return (
    <article className="article">
      <header className="page-head">
        <div className="eyebrow">about</div>
        <h1>关于这个树洞</h1>
      </header>

      <div className="article-body">
        <p>嗨，欢迎来到这里。</p>

        <p>
          这是我自己的小角落。<strong>不是一个想被很多人看见的地方</strong>，
          更像深夜里能放下一切讲话的树洞——
          把那些没人可说、又不忍丢掉的情绪、感受、想法，
          一行一行地记下来，让它们有个地方安放。
        </p>

        <p>在这里我会写：</p>

        <ul>
          <li>每天遇到的小事、心里的起伏</li>
          <li>看过的书、电影、画与歌带来的回响</li>
          <li>对自己、对世界、对身边人的一些零星想法</li>
          <li>路上偶然遇到的光、雨、晚霞、街角的某只猫</li>
        </ul>

        <h2>关于节气</h2>

        <p>
          每篇日志都会自动标出当日的<strong>二十四节气</strong>。
          我相信人的情绪是跟着季节走的——立春会有新生的躁动，
          小满会有半满半空的怅然，霜降会突然想念远方的人。
          所以每个节气都对应一个温柔的情绪基调，作为参照。
        </p>

        <h2>关于这本"日记"</h2>

        <p>
          界面尽量做得像翻一本旧书——米白纸张、衬线字体、留白多一点，
          少一些屏幕的冷感。右上角可以切换到夜间模式，方便深夜书写。
        </p>

        <p>如果你不小心走到了这里，请轻一点翻阅，慢一点离开。</p>

        <hr />

        <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontStyle: 'italic' }}>
          —— 树洞主人
        </p>
      </div>
    </article>
  );
}
