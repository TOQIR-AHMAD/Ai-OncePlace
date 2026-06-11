import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, BadgeCheck, CalendarDays, ChevronRight } from 'lucide-react';
import {
  categories as allCategories,
  getCategoryBySlug,
  getRelatedTools,
  getToolBySlug,
  tools,
} from '@/lib/data';
import { ToolCard } from '@/components/ToolCard';
import { PricingBadge } from '@/components/PricingBadge';
import { Logo } from '@/components/Logo';
import { Reveal } from '@/components/Reveal';
import {
  PRICING_META,
  SITE_NAME,
  SITE_URL,
  formatDate,
  getDomain,
  getLogo,
} from '@/lib/utils';

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};

  const title = `${tool.name} — ${PRICING_META[tool.pricing].label} AI Tool`;
  const description = tool.description;
  const url = `${SITE_URL}/tool/${tool.slug}`;
  const image = getLogo(tool);

  return {
    title,
    description,
    alternates: { canonical: `/tool/${tool.slug}` },
    openGraph: {
      type: 'website',
      title: `${tool.name} | ${SITE_NAME}`,
      description,
      url,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary',
      title: `${tool.name} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const toolCategories = tool.categories
    .map((slug) => getCategoryBySlug(slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const related = getRelatedTools(tool);
  const domain = getDomain(tool.url);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: tool.url,
    image: getLogo(tool),
    applicationCategory: toolCategories[0]?.name ?? 'AI Tool',
    operatingSystem: 'Web',
    datePublished: tool.dateAdded,
  };

  // Tools with a free entry point ($0 to start) advertise an offer; paid-only tools don't.
  if (tool.pricing !== 'paid') {
    jsonLd.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: PRICING_META[tool.pricing].label,
    };
  }

  return (
    <div className="container-page py-10">
      <script
        type="application/ld+json"
        // JSON-LD structured data for rich results.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
      >
        <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link href="/tools" className="hover:text-slate-700 dark:hover:text-slate-200">
          Tools
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-slate-700 dark:text-slate-200">{tool.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Main */}
        <article className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <Logo
              src={getLogo(tool)}
              alt={`${tool.name} logo`}
              size={64}
              className="h-16 w-16 flex-shrink-0 rounded-xl bg-slate-100 object-contain p-1.5 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
            />
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {tool.name}
                {tool.verified && (
                  <BadgeCheck
                    className="h-6 w-6 text-brand-500"
                    aria-label="Verified"
                  />
                )}
              </h1>
              <a
                href={tool.url}
                target="_blank"
                rel="sponsored nofollow noopener"
                className="mt-1 inline-block text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400"
              >
                {domain}
              </a>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <PricingBadge pricing={tool.pricing} />
            {toolCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <p className="mt-6 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            {tool.description}
          </p>

          {tool.tags.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tags
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <a
              href={tool.url}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Visit {tool.name}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </a>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Pricing</dt>
                <dd>
                  <PricingBadge pricing={tool.pricing} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Website</dt>
                <dd className="truncate pl-3 font-medium text-slate-900 dark:text-white">
                  {domain}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" /> Added
                </dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {formatDate(tool.dateAdded)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Related tools
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t, i) => (
              <Reveal key={t.slug} delay={(i % 4) * 0.06}>
                <ToolCard tool={t} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
