import type { Pricing, Tool } from './types';

/** Public base URL of the site. Configure via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://axploria.pages.dev'
).replace(/\/$/, '');

export const SITE_NAME = 'Axploria';
export const SITE_TAGLINE = 'The directory of the best AI tools';

/** Convert an arbitrary string to a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD') // decompose accented characters
    .replace(/[̀-ͯ]/g, '') // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric -> hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-'); // collapse repeats
}

/** Extract a bare hostname (no www) from a URL, safely. */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Resolve a tool's logo. Uses the explicit logo when present, otherwise falls
 * back to Google's favicon service for the tool's domain.
 */
export function getLogo(tool: Pick<Tool, 'logo' | 'url'>): string {
  if (tool.logo && tool.logo.trim().length > 0) return tool.logo;
  const domain = getDomain(tool.url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Format an ISO date deterministically (UTC) to e.g. "Jun 5, 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export interface PricingMeta {
  label: string;
  /** Tailwind classes for the colored badge (light + dark). */
  badge: string;
}

/** Color-coded pricing metadata: green=free, blue=freemium, orange=paid, purple=free-trial. */
export const PRICING_META: Record<Pricing, PricingMeta> = {
  free: {
    label: 'Free',
    badge:
      'bg-green-100 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-400/20',
  },
  freemium: {
    label: 'Freemium',
    badge:
      'bg-blue-100 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20',
  },
  paid: {
    label: 'Paid',
    badge:
      'bg-orange-100 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-400/20',
  },
  'free-trial': {
    label: 'Free Trial',
    badge:
      'bg-purple-100 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-400/20',
  },
};

export const PRICING_OPTIONS: Pricing[] = ['free', 'freemium', 'paid', 'free-trial'];
