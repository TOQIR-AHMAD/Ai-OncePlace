'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, ChevronUp, Star } from 'lucide-react';
import type { Tool } from '@/lib/types';
import { getDomain, getLogo } from '@/lib/utils';
import { PricingBadge } from './PricingBadge';
import { Logo } from './Logo';

// Popularity threshold above which a tool earns the orange "TOP" corner ribbon.
const TOP_THRESHOLD = 500;

export function ToolCard({ tool }: { tool: Tool }) {
  const isTop = tool.upvotes >= TOP_THRESHOLD;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500"
    >
      {/* Orange diagonal "TOP" ribbon for high-upvote tools */}
      {isTop && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-9 top-3 z-10 w-32 rotate-45 bg-orange-500 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
        >
          Top
        </span>
      )}

      <Link href={`/tool/${tool.slug}`} className="flex h-full flex-col p-5 text-center">
        {/* Top row: upvotes + featured tag (pad right so it clears the TOP ribbon) */}
        <div className={`flex items-center justify-between ${isTop ? 'pr-8' : ''}`}>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <ChevronUp className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            {tool.upvotes}
          </span>
          {tool.featured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
              Featured
            </span>
          )}
        </div>

        {/* Icon + name (centered unit) */}
        <div className="mt-4 flex flex-col items-center">
          <Logo
            src={getLogo(tool)}
            alt={`${tool.name} logo`}
            size={48}
            className="h-12 w-12 rounded-xl bg-slate-100 object-contain p-1.5 ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105 dark:bg-slate-800 dark:ring-slate-700"
          />
          <h3 className="mt-3 flex items-center justify-center gap-1 text-base font-bold text-slate-900 dark:text-white">
            <span className="truncate">{tool.name}</span>
            {tool.verified && (
              <BadgeCheck className="h-4 w-4 flex-shrink-0 text-brand-500" aria-label="Verified" />
            )}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">{getDomain(tool.url)}</p>
          {/* Gradient underline accent */}
          <span aria-hidden="true" className="accent-underline mt-2 h-[3px] w-14 rounded-full" />
        </div>

        {/* Description in quotes */}
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          &laquo;&nbsp;{tool.description}&nbsp;&raquo;
        </p>

        {/* Footer: pricing + VISIT button */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <PricingBadge pricing={tool.pricing} />
        </div>
        <span className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-colors group-hover:bg-brand-700">
          Visit
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </motion.article>
  );
}
