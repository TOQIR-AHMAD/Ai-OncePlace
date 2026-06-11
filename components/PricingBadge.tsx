import type { Pricing } from '@/lib/types';
import { PRICING_META } from '@/lib/utils';

export function PricingBadge({
  pricing,
  className = '',
}: {
  pricing: Pricing;
  className?: string;
}) {
  const meta = PRICING_META[pricing];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badge} ${className}`}
    >
      {meta.label}
    </span>
  );
}
