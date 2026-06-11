import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/utils';

export function Footer() {
  const year = 2026;
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {SITE_NAME}
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {SITE_TAGLINE}. Discover, compare, and stay up to date with the fast-moving
              world of AI tools.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm" aria-label="Footer">
            <Link href="/tools" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              All Tools
            </Link>
            <Link href="/#categories" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Categories
            </Link>
            <Link href="/submit" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Submit a Tool
            </Link>
            <Link href="/sitemap.xml" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Sitemap
            </Link>
          </nav>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          <p>
            &copy; {year} {SITE_NAME}. Built with Next.js &amp; Tailwind CSS. Tool names and
            logos are property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
