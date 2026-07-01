'use client';

import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Search, SlidersHorizontal } from 'lucide-react';
import type { Category, Pricing, Tool } from '@/lib/types';
import { PRICING_META, PRICING_OPTIONS } from '@/lib/utils';
import { ToolCard } from './ToolCard';
import { useToast } from './Toast';

type Sort = 'newest' | 'popular';

const selectClass =
  'h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-brand-500/40 transition focus:border-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

export function ToolsExplorer({
  tools,
  categories,
  initialCategory = '',
}: {
  tools: Tool[];
  categories: Category[];
  initialCategory?: string;
}) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [pricing, setPricing] = useState<'' | Pricing>('');
  const [verified, setVerified] = useState(false);
  const [sort, setSort] = useState<Sort>('newest');

  // Hydrate initial state from the URL (?q, ?category, ?pricing, ?verified, ?sort).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const cat = params.get('category');
    const price = params.get('pricing');
    if (q) setQuery(q);
    if (cat) setCategory(cat);
    if (price && PRICING_OPTIONS.includes(price as Pricing)) setPricing(price as Pricing);
    if (params.get('verified') === '1') setVerified(true);
    if (params.get('sort') === 'popular') setSort('popular');
  }, []);

  // Keep the URL shareable as filters change (no navigation / no scroll jump).
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category) params.set('category', category);
    if (pricing) params.set('pricing', pricing);
    if (verified) params.set('verified', '1');
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [query, category, pricing, verified]);

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
    try {
      const q = query.trim();
      let list = q ? fuse.search(q).map((r) => r.item) : tools.slice();

      if (category) list = list.filter((t) => t.categories.includes(category));
      if (pricing) list = list.filter((t) => t.pricing === pricing);
      if (verified) list = list.filter((t) => t.verified);

      list.sort((a, b) =>
        sort === 'popular'
          ? b.upvotes - a.upvotes
          : b.dateAdded.localeCompare(a.dateAdded),
      );

      return list;
    } catch (err) {
      toast.error('Could not filter tools', err instanceof Error ? err.message : undefined);
      return [];
    }
  }, [fuse, query, category, pricing, verified, sort, tools, toast]);

  function clearFilters() {
    setQuery('');
    setCategory('');
    setPricing('');
    setVerified(false);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            aria-label="Search tools"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none ring-brand-500/40 transition focus:border-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal
            className="hidden h-4 w-4 text-slate-400 sm:block"
            aria-hidden="true"
          />

          <label className="sr-only" htmlFor="filter-category">
            Filter by category
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="filter-pricing">
            Filter by pricing
          </label>
          <select
            id="filter-pricing"
            value={pricing}
            onChange={(e) => setPricing(e.target.value as '' | Pricing)}
            className={selectClass}
          >
            <option value="">All pricing</option>
            {PRICING_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {PRICING_META[p].label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="filter-sort">
            Sort
          </label>
          <select
            id="filter-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className={selectClass}
          >
            <option value="newest">Newest</option>
            <option value="popular">Most popular</option>
          </select>

          <button
            type="button"
            onClick={() => setVerified((v) => !v)}
            aria-pressed={verified}
            className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
              verified
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300'
                : 'border-slate-200 bg-white text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Verified
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        <motion.span
          key={results.length}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="font-semibold text-slate-700 dark:text-slate-200"
        >
          {results.length}
        </motion.span>{' '}
        {results.length === 1 ? 'tool' : 'tools'}
        {category
          ? ` in ${categories.find((c) => c.slug === category)?.name ?? category}`
          : ''}
      </p>

      {results.length > 0 ? (
        <motion.div layout className="mt-4 grid-cards">
          <AnimatePresence mode="popLayout">
            {results.map((tool) => (
              <motion.div
                key={tool.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300">No tools match your filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
