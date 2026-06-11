'use client';

import { useEffect, useRef, useState } from 'react';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Counts up from 0 to `value` once, on mount. */
export function AnimatedCounter({
  value,
  duration = 1200,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    let start: number | undefined;
    const step = (now: number) => {
      if (start === undefined) start = now;
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(easeOut(progress) * value));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}
