'use client';

import { useState } from 'react';

// Neutral inline placeholder shown if a tool's logo/favicon fails to load.
const FALLBACK_LOGO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="m8 13 2.5-3 2 2.5L15 9l3 4"/><circle cx="9" cy="8.5" r="1"/></svg>',
  );

export function Logo({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored ? FALLBACK_LOGO : src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!errored) setErrored(true);
      }}
      className={className}
    />
  );
}
