import Link from 'next/link';
import { categories, getToolCountByCategory } from '@/lib/data';
import { CategoryIcon } from './CategoryIcon';
import { Reveal } from './Reveal';

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category, i) => {
        const count = getToolCountByCategory(category.slug);
        return (
          <Reveal key={category.slug} delay={(i % 5) * 0.05}>
            <Link
              href={`/category/${category.slug}`}
              className="group flex h-full flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
                <CategoryIcon name={category.icon} className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                {category.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {count} {count === 1 ? 'tool' : 'tools'}
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
