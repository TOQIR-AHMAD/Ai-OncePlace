'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import type { Tool } from '@/lib/types';
import { getDomain, getLogo } from '@/lib/utils';
import { Logo } from './Logo';
import { useToast } from './Toast';

export function HeroSearch({ tools }: { tools: Tool[] }) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'tags', weight: 2 },
          { name: 'description', weight: 1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [tools],
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    try {
      return fuse.search(q, { limit: 6 }).map((r) => r.item);
    } catch (err) {
      toast.error('Search failed', err instanceof Error ? err.message : undefined);
      return [];
    }
  }, [fuse, query, toast]);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function submit() {
    const q = query.trim();
    router.push(q ? `/tools?q=${encodeURIComponent(q)}` : '/tools');
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-2xl">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="group relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-500"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search 40+ AI tools — try “image”, “coding”, “voice”…"
            aria-label="Search AI tools"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white/90 pl-12 pr-28 text-base text-slate-900 shadow-sm outline-none ring-brand-500/40 backdrop-blur transition focus:border-brand-500 focus:ring-4 dark:border-slate-700 dark:bg-slate-900/90 dark:text-white"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-brand-500/30 active:scale-95"
          >
            Search
          </button>
        </div>
      </form>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95"
          >
            <ul className="max-h-80 overflow-auto py-1 text-left">
              {results.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tool/${tool.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Logo
                      src={getLogo(tool)}
                      alt=""
                      size={28}
                      className="h-7 w-7 rounded-md bg-slate-100 object-contain p-0.5 dark:bg-slate-800"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                        {tool.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {getDomain(tool.url)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
