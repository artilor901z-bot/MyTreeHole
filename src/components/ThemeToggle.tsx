'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function getInitial(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getInitial();
    apply(t);
    setTheme(t);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    apply(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={theme === 'light' ? '切换到夜间' : '切换到日间'}
      title={theme === 'light' ? '切换到夜间' : '切换到日间'}
      onClick={toggle}
      suppressHydrationWarning
    >
      {mounted ? (theme === 'light' ? '☾' : '☼') : '·'}
    </button>
  );
}
