import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/utils';

const LINKS: { heading: string; items: { href: string; label: string }[] }[] = [
  {
    heading: 'Explore',
    items: [
      { href: '/tools', label: 'All Tools' },
      { href: '/#categories', label: 'Categories' },
      { href: '/tools?sort=popular', label: 'Most Popular' },
    ],
  },
  {
    heading: 'Community',
    items: [
      { href: '/submit', label: 'Submit a Tool' },
      { href: '/sitemap.xml', label: 'Sitemap' },
    ],
  },
];

export function Footer() {
  const year = 2026;
  return (
    <footer className="mt-20 bg-ink-950 text-slate-300">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" aria-label={`${SITE_NAME} home`}>
              <BrandLogo tone="light" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {SITE_TAGLINE}. Discover, compare, and stay up to date with the
              fast-moving world of AI tools.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-2">
            {LINKS.map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {col.heading}
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-slate-400 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">
          <p>
            &copy; {year} {SITE_NAME}. Built with Next.js &amp; Tailwind CSS. Tool
            names and logos are property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
