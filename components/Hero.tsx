'use client';

import { motion, type Variants } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Category, Tool } from '@/lib/types';
import { HeroSearch } from './HeroSearch';
import { AnimatedCounter } from './AnimatedCounter';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export function Hero({
  tools,
  categories,
  totalCount,
}: {
  tools: Tool[];
  categories: Category[];
  totalCount: number;
}) {
  return (
    <section className="relative border-b border-slate-200 dark:border-slate-800">
      {/* Lined grid backdrop, faded toward the edges */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container-page py-16 text-center sm:py-24"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 shadow-sm backdrop-blur dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
        >
          <AnimatedCounter value={totalCount} />+ AI tools analyzed and listed
        </motion.span>

        <motion.h1
          variants={item}
          className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-6xl"
        >
          AI Tools <span className="text-gradient animate-gradient">Directory</span>
          <span className="mx-auto mt-3 block h-1 w-40 rounded-full accent-underline" />
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-1.5 text-pretty text-lg text-slate-600 dark:text-slate-300"
        >
          Access the largest list of top-quality AI tools available on the web
          <Star className="h-4 w-4 fill-accent-500 text-accent-500" aria-hidden="true" />
        </motion.p>

        <motion.div variants={item} className="mt-9">
          <HeroSearch tools={tools} categories={categories} />
        </motion.div>

        <motion.div
          variants={item}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400"
        >
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {categories.length} categories
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Updated <span className="font-semibold text-slate-700 dark:text-slate-200">daily</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            100% manually verified
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
