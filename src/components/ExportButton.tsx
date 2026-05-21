'use client';

import { useState } from 'react';
import { withBase } from '@/lib/paths';

export default function ExportButton() {
  const [busy, setBusy] = useState(false);

  async function onExport() {
    try {
      setBusy(true);
      const res = await fetch(withBase('/search-index.json'));
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `tree-hole-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="btn-link" onClick={onExport} disabled={busy}>
      {busy ? '导出中…' : '导出所有日志 ↓'}
    </button>
  );
}
