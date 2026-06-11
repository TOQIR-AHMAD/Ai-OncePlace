import type { Metadata } from 'next';
import { ToolsExplorer } from '@/components/ToolsExplorer';
import { categories, tools, totalToolCount } from '@/lib/data';

export const metadata: Metadata = {
  title: 'All AI Tools',
  description: `Browse and search all ${totalToolCount}+ AI tools in the Axploria directory. Filter by category and pricing, and sort by newest or most popular.`,
  alternates: { canonical: '/tools' },
};

export default function ToolsPage() {
  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          All AI Tools
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Search the full directory of {totalToolCount}+ AI tools. Filter by category and
          pricing, then sort by newest or most popular.
        </p>
      </header>

      <ToolsExplorer tools={tools} categories={categories} />
    </div>
  );
}
