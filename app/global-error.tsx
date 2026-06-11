'use client';

import { useEffect } from 'react';
import './globals.css';

// Last-resort boundary: catches errors thrown by the root layout itself.
// Must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </span>
          </div>
          <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Something went wrong</h1>
          <p className="mt-3 max-w-md text-slate-400">
            A critical error occurred while loading the app. Please try reloading the page.
          </p>
          {error?.digest && (
            <p className="mt-2 text-xs text-slate-500">
              Reference: <code className="font-mono">{error.digest}</code>
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
