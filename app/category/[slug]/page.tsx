import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import {
  categories,
  getCategoryBySlug,
  getToolsByCategory,
} from '@/lib/data';
import { ToolCard } from '@/components/ToolCard';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Reveal } from '@/components/Reveal';

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const category = getCategoryBySlug(params.slug);
  if (!category) return {};

  const count = getToolsByCategory(category.slug).length;
  const title = `Best AI ${category.name} Tools in 2026`;
  const description = `Discover the ${count} best AI ${category.name.toLowerCase()} tools in 2026. ${category.description}`;

  return {
    title,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/category/${category.slug}`,
    },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  const categoryTools = getToolsByCategory(category.slug);

  return (
    <div className="container-page py-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
      >
        <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link href="/#categories" className="hover:text-slate-700 dark:hover:text-slate-200">
          Categories
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-slate-700 dark:text-slate-200">{category.name}</span>
      </nav>

      <header className="mt-6 flex items-start gap-4">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <CategoryIcon name={category.icon} className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Best AI {category.name} Tools in 2026
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
            {category.description}
          </p>
        </div>
      </header>

      <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
        {categoryTools.length} {categoryTools.length === 1 ? 'tool' : 'tools'}
      </p>

      {categoryTools.length > 0 ? (
        <div className="mt-4 grid-cards">
          {categoryTools.map((tool, i) => (
            <Reveal key={tool.slug} delay={(i % 3) * 0.06}>
              <ToolCard tool={tool} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-slate-600 dark:text-slate-300">
          No tools in this category yet. Check back soon.
        </p>
      )}

      {/* Other categories */}
      <section className="mt-16">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Explore other categories
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories
            .filter((c) => c.slug !== category.slug)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <CategoryIcon name={c.icon} className="h-4 w-4" />
                {c.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
