import toolsJson from '@/data/tools.json';
import categoriesJson from '@/data/categories.json';
import type { Category, Tool } from './types';

/** All tools, sorted newest-first by default. */
export const tools: Tool[] = (toolsJson as unknown as Tool[])
  .slice()
  .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));

export const categories: Category[] = categoriesJson as unknown as Category[];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getToolsByCategory(categorySlug: string): Tool[] {
  return tools.filter((t) => t.categories.includes(categorySlug));
}

/** Newest N tools by dateAdded. */
export function getLatestTools(limit = 12): Tool[] {
  return tools.slice(0, limit);
}

/** Featured tools, most upvoted first. */
export function getFeaturedTools(limit = 8): Tool[] {
  return tools
    .filter((t) => t.featured)
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, limit);
}

/** Most upvoted tools. */
export function getPopularTools(limit = 12): Tool[] {
  return tools
    .slice()
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, limit);
}

export function getToolCountByCategory(categorySlug: string): number {
  return tools.reduce(
    (count, t) => (t.categories.includes(categorySlug) ? count + 1 : count),
    0,
  );
}

/** Related tools sharing at least one category, excluding the given tool. */
export function getRelatedTools(tool: Tool, limit = 4): Tool[] {
  return tools
    .filter(
      (t) =>
        t.slug !== tool.slug &&
        t.categories.some((c) => tool.categories.includes(c)),
    )
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, limit);
}

export const totalToolCount = tools.length;
