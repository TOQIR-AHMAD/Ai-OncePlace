import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { ToolCard } from '@/components/ToolCard';
import { CategoryGrid } from '@/components/CategoryGrid';
import { Reveal } from '@/components/Reveal';
import {
  categories,
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
      <Hero tools={tools} categories={categories} totalCount={totalToolCount} />

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
        <div className="mt-6 grid-cards">
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
            <div className="mt-6 grid-cards">
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

      {/* Closing SEO section over a soft pastel wash */}
      <section className="pastel-wash">
        <div className="container-page py-20 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-balance text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
              The World&apos;s Best AI Tools Directory
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-slate-600 dark:text-slate-300">
              Axploria is a curated, always-updating catalog of the best AI tools on the
              web. Every tool is hand-checked and sorted into clear categories so you can
              find exactly what you need — from chatbots and image generators to coding
              assistants and productivity boosters — in seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                See the full list
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white/70 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200"
              >
                Submit a tool
              </Link>
            </div>
          </Reveal>
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
