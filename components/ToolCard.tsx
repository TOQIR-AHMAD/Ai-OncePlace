'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import type { Tool } from '@/lib/types';
import { getDomain, getLogo } from '@/lib/utils';
import { PricingBadge } from './PricingBadge';
import { Logo } from './Logo';

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative h-full rounded-xl border border-slate-200 bg-white transition-colors hover:border-brand-400 hover:shadow-xl hover:shadow-brand-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500"
    >
      {/* Soft gradient glow on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-fuchsia-500/0 opacity-0 transition-opacity duration-300 group-hover:from-brand-500/[0.06] group-hover:to-fuchsia-500/[0.06] group-hover:opacity-100"
      />
      <Link href={`/tool/${tool.slug}`} className="relative flex h-full flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <Logo
            src={getLogo(tool)}
            alt={`${tool.name} logo`}
            size={40}
            className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-100 object-contain p-1 ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105 dark:bg-slate-800 dark:ring-slate-700"
          />
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1 text-base font-semibold text-slate-900 dark:text-white">
              <span className="truncate">{tool.name}</span>
              {tool.verified && (
                <BadgeCheck
                  className="h-4 w-4 flex-shrink-0 text-brand-500"
                  aria-label="Verified"
                />
              )}
            </h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {getDomain(tool.url)}
            </p>
          </div>
          <PricingBadge pricing={tool.pricing} />
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {tool.description}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </motion.article>
  );
}
