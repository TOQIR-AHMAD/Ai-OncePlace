'use client';

import { motion, type Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { Tool } from '@/lib/types';
import { HeroSearch } from './HeroSearch';
import { AnimatedCounter } from './AnimatedCounter';
import { SITE_NAME } from '@/lib/utils';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export function Hero({ tools, totalCount }: { tools: Tool[]; totalCount: number }) {
  return (
    <section className="relative border-b border-slate-200 dark:border-slate-800">
      {/* Animated background — clipped here (not on the section) so it doesn't crop the search dropdown */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 left-[15%] h-72 w-72 rounded-full bg-brand-500/30 blur-3xl animate-blob" />
        <div className="absolute -top-10 right-[15%] h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-blob [animation-delay:4s]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl animate-blob [animation-delay:8s]" />
        <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container-page py-20 text-center sm:py-28"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/70 px-3 py-1 text-xs font-medium text-brand-700 backdrop-blur dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
        >
          <Sparkles className="h-3.5 w-3.5 animate-float" aria-hidden="true" />
          <AnimatedCounter value={totalCount} />+ AI tools and counting
        </motion.span>

        <motion.h1
          variants={item}
          className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl"
        >
          Discover the best{' '}
          <span className="text-gradient animate-gradient">AI tools</span> for everything
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-slate-600 dark:text-slate-300"
        >
          {SITE_NAME} is a curated, always-updating directory of AI tools. Search, filter by
          category and pricing, and find the right tool in seconds.
        </motion.p>

        <motion.div variants={item} className="mt-9">
          <HeroSearch tools={tools} />
        </motion.div>

        <motion.div
          variants={item}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400"
        >
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            <AnimatedCounter value={totalCount} /> tools
          </span>
          <span aria-hidden="true">·</span>
          <span>15 categories</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            updated daily
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
