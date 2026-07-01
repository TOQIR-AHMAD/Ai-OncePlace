'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Search } from 'lucide-react';
import type { Category, Tool } from '@/lib/types';
import { PRICING_META, PRICING_OPTIONS, getDomain, getLogo } from '@/lib/utils';
import { Logo } from './Logo';
import { useToast } from './Toast';

export function HeroSearch({
  tools,
  categories,
}: {
  tools: Tool[];
  categories: Category[];
}) {
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
    <div ref={containerRef} className="relative mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-lg shadow-brand-500/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="group relative flex-1">
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
              placeholder="Search over 40+ AI tools…"
              aria-label="Search AI tools"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-900 outline-none ring-brand-500/40 transition focus:border-brand-500 focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <label className="sr-only" htmlFor="hero-category">
            Filter by category
          </label>
          <select
            id="hero-category"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) router.push(`/tools?category=${e.target.value}`);
            }}
            className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-brand-500/40 transition focus:border-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-12 shrink-0 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-brand-500/30 active:scale-95"
          >
            Search
          </button>
        </form>

        {/* Colored filter pills */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 px-1">
          <Link
            href="/tools?verified=1"
            className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
          >
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified
          </Link>
          {PRICING_OPTIONS.map((p) => (
            <Link
              key={p}
              href={`/tools?pricing=${p}`}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-transform hover:scale-105 ${PRICING_META[p].badge}`}
            >
              {PRICING_META[p].label}
            </Link>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/95 text-left shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95"
          >
            <ul className="max-h-80 overflow-auto py-1">
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
