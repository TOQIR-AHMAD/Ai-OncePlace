import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';
import { SITE_NAME } from '@/lib/utils';

const NAV = [
  { href: '/tools', label: 'Tools' },
  { href: '/#categories', label: 'Categories' },
  { href: '/submit', label: 'Submit' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-ink-950/90">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${SITE_NAME} home`}>
          <BrandLogo />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/submit"
            className="ml-1 hidden rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 sm:inline-flex"
          >
            Add a tool
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
