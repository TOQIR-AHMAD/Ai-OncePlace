'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'axploria:announcement-dismissed';

/**
 * Thin dismissible bar pinned above the header (aixploria-style).
 * The dismissed state is remembered in localStorage.
 */
export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  // Only reveal after mount so SSR markup doesn't flash before we can read storage.
  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== '1');
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore storage failures */
    }
  }

  return (
    <div className="relative border-b border-brand-100 bg-brand-50 dark:border-brand-500/20 dark:bg-brand-500/10">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center gap-3 px-10 py-2 text-center text-sm text-slate-700 dark:text-slate-200">
        <Sparkles className="h-4 w-4 flex-shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
        <span className="font-medium">
          New AI tools added every day — always free to browse.
        </span>
        <Link
          href="/tools"
          className="hidden shrink-0 items-center gap-1 rounded-full bg-accent-500 px-3 py-0.5 text-xs font-bold text-ink-900 transition-transform hover:scale-105 sm:inline-flex"
        >
          Explore now
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
