import type { Metadata } from 'next';
import { CheckCircle2, Send } from 'lucide-react';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Submit an AI Tool',
  description: `Submit your AI tool to ${SITE_NAME}. Every submission is reviewed before it is added to the directory.`,
  alternates: { canonical: '/submit' },
};

// Replace this with your real Tally form ID (e.g. "w7XpQA").
const TALLY_FORM_ID = 'YOUR_TALLY_FORM_ID';

const STEPS = [
  'Fill in the submission form below with your tool name, URL, a one-line description, category, and pricing.',
  'Our pipeline + a human reviewer check the submission for quality and accuracy.',
  'Approved tools are published to the directory, usually within a few days.',
];

export default function SubmitPage() {
  const tallySrc = `https://tally.so/embed/${TALLY_FORM_ID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;

  return (
    <div className="container-page max-w-3xl py-12">
      <header>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Send className="h-3.5 w-3.5" aria-hidden="true" /> Submit a tool
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Submit your AI tool
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          Built something great? Add it to {SITE_NAME}. Submissions are free, and every
          tool is reviewed before it goes live.
        </p>
      </header>

      <ol className="mt-10 space-y-4">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500"
              aria-hidden="true"
            />
            <span className="text-slate-700 dark:text-slate-300">{step}</span>
          </li>
        ))}
      </ol>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Submission form
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {/*
            Placeholder for a Tally.so embedded form.
            1. Create a free form at https://tally.so
            2. Set TALLY_FORM_ID above to your form's ID.
            The iframe below will then render your live form.
          */}
          {TALLY_FORM_ID === 'YOUR_TALLY_FORM_ID' ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-950">
              <p className="font-medium text-slate-700 dark:text-slate-200">
                Tally form placeholder
              </p>
              <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
                Create a free form at{' '}
                <a
                  href="https://tally.so"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 underline dark:text-brand-400"
                >
                  tally.so
                </a>{' '}
                and set <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">TALLY_FORM_ID</code>{' '}
                in <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">app/submit/page.tsx</code>{' '}
                to embed it here.
              </p>
            </div>
          ) : (
            <iframe
              src={tallySrc}
              loading="lazy"
              width="100%"
              height="600"
              title="Submit your AI tool"
              className="w-full rounded-xl"
            />
          )}
        </div>
      </section>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        Prefer email? You can also open a pull request adding your tool to{' '}
        <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">data/tools.json</code>.
      </p>
    </div>
  );
}
