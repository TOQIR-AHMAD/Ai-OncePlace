'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for observability; the user already sees a friendly message.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative flex h-20 w-20 items-center justify-center"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/30">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl"
      >
        Something went wrong
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-3 max-w-md text-slate-600 dark:text-slate-400"
      >
        We hit an unexpected error while loading this page. You can try again, or head back
        to safety — nothing on your end is broken.
      </motion.p>

      {error?.digest && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Reference: <code className="font-mono">{error.digest}</code>
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Back home
        </Link>
      </motion.div>
    </div>
  );
}
