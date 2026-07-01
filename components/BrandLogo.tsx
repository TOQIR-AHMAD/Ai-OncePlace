import { SITE_NAME } from '@/lib/utils';

/**
 * The Axploria wordmark: a yellow boxed "A" followed by the rest of the name,
 * echoing the aixploria-style boxed logo. `tone` switches the text color for
 * use on light headers vs. the dark footer.
 */
export function BrandLogo({
  className = '',
  tone = 'dark',
}: {
  className?: string;
  tone?: 'dark' | 'light';
}) {
  // First letter goes inside the yellow box; the remainder sits beside it.
  const first = SITE_NAME.charAt(0).toUpperCase();
  const rest = SITE_NAME.slice(1).toUpperCase();

  return (
    <span className={`inline-flex items-center ${className}`} aria-label={SITE_NAME}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500 text-lg font-black text-ink-900 shadow-sm">
        {first}
      </span>
      <span
        className={`ml-1 text-xl font-extrabold tracking-tight ${
          tone === 'light' ? 'text-white' : 'text-ink-900 dark:text-white'
        }`}
      >
        {rest}
      </span>
    </span>
  );
}
