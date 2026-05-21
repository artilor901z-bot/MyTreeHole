'use client';

import { useEffect, useRef } from 'react';

// 可被 NEXT_PUBLIC_CUSDIS_APP_ID 环境变量覆盖；默认用项目主人的 cusdis APP_ID
const APP_ID =
  process.env.NEXT_PUBLIC_CUSDIS_APP_ID ||
  '03e2819a-752e-47a9-9d2b-5ab6907636a1';

interface Props {
  pageId: string;
  pageTitle: string;
}

declare global {
  interface Window {
    CUSDIS?: {
      initial: () => void;
      setTheme: (t: 'light' | 'dark' | 'auto') => void;
    };
  }
}

export default function Comments({ pageId, pageTitle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!APP_ID) return;

    // 加载 cusdis 脚本一次
    const existing = document.getElementById('cusdis-script') as HTMLScriptElement | null;
    if (!existing) {
      const s = document.createElement('script');
      s.id = 'cusdis-script';
      s.src = 'https://cusdis.com/js/cusdis.es.js';
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    } else {
      // 已加载，强制重新渲染（切换文章时）
      window.CUSDIS?.initial();
    }

    // 主题联动：随 <html data-theme="..."> 变化通知 cusdis
    function syncTheme() {
      const t = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      window.CUSDIS?.setTheme(t);
    }

    // 初次设置 + 监听
    const tryInit = setInterval(() => {
      if (window.CUSDIS) {
        syncTheme();
        clearInterval(tryInit);
      }
    }, 200);

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      clearInterval(tryInit);
      observer.disconnect();
    };
  }, [pageId]);

  if (!APP_ID) return null;

  return (
    <section className="comments">
      <div className="comments-head">
        <div className="ornament" />
        <div className="eyebrow">comments</div>
        <h3>留言</h3>
        <div className="sub">匿名也欢迎，留个昵称就行。</div>
      </div>
      <div
        ref={containerRef}
        id="cusdis_thread"
        data-host="https://cusdis.com"
        data-app-id={APP_ID}
        data-page-id={pageId}
        data-page-title={pageTitle}
        data-theme="auto"
      />
    </section>
  );
}
