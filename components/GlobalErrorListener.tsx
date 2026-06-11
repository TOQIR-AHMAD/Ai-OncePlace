'use client';

import { useEffect } from 'react';
import { useToast } from './Toast';

/**
 * Mounts once in the root layout. Catches any uncaught runtime error or
 * unhandled promise rejection anywhere in the app and surfaces a single,
 * professional toast instead of failing silently.
 *
 * Note: listeners are attached in the bubble phase, so resource-load failures
 * (e.g. a broken logo image) do NOT trigger a toast — those are handled
 * locally with a graceful fallback in <Logo />.
 */
export function GlobalErrorListener() {
  const toast = useToast();

  useEffect(() => {
    function onError(event: ErrorEvent) {
      const message =
        event.error?.message || event.message || 'An unexpected error occurred.';
      toast.error('Something went wrong', clip(message));
    }

    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message =
        (reason && (reason.message || String(reason))) ||
        'An unexpected error occurred.';
      toast.error('Something went wrong', clip(message));
    }

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [toast]);

  return null;
}

function clip(message: string, max = 140): string {
  const m = message.trim();
  return m.length > max ? `${m.slice(0, max)}…` : m;
}
