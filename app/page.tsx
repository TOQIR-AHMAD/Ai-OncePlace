import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { ToolCard } from '@/components/ToolCard';
import { CategoryGrid } from '@/components/CategoryGrid';
import { Reveal } from '@/components/Reveal';
import {
  getFeaturedTools,
  getLatestTools,
  tools,
  totalToolCount,
} from '@/lib/data';

export default function HomePage() {
  const latest = getLatestTools(12);
  const featured = getFeaturedTools(8);

  return (
    <>
      <Hero tools={tools} totalCount={totalToolCount} />

      {/* Latest */}
      <section className="container-page py-16">
        <Reveal>
          <SectionHeading
            title="Latest AI Tools"
            subtitle="The newest additions to the directory."
            href="/tools"
            linkLabel="Browse all"
          />
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((tool, i) => (
            <Reveal key={tool.slug} delay={(i % 4) * 0.06}>
              <ToolCard tool={tool} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
          <div className="container-page py-16">
            <Reveal>
              <SectionHeading
                title="Featured Tools"
                subtitle="Hand-picked tools worth a look."
              />
            </Reveal>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((tool, i) => (
                <Reveal key={tool.slug} delay={(i % 4) * 0.06}>
                  <ToolCard tool={tool} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section id="categories" className="container-page scroll-mt-20 py-16">
        <Reveal>
          <SectionHeading
            title="Browse by Category"
            subtitle="Explore tools grouped by what they do."
          />
        </Reveal>
        <div className="mt-6">
          <CategoryGrid />
        </div>
      </section>
    </>
  );
}

function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-slate-600 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
