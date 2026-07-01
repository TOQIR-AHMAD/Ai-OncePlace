import type { Metadata } from 'next';
import { CheckCircle2, Send } from 'lucide-react';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Submit an AI Tool',
  description: `Submit your AI tool to ${SITE_NAME}. Every submission is reviewed before it is added to the directory.`,
  alternates: { canonical: '/submit' },
};

const STEPS = [
  'Open a pull request adding your tool to data/tools.json with its name, URL, a one-line description, category, and pricing.',
  'Our pipeline + a human reviewer check the submission for quality and accuracy.',
  'Approved tools are published to the directory, usually within a few days.',
];

export default function SubmitPage() {
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
    </div>
  );
}
