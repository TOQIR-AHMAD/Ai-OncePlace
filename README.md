# Axploria — AI Tools Directory

A production-ready, **100% free-infrastructure** AI tools directory (in the spirit of
aixploria.com / futurepedia.io) with a fully automated tool-discovery pipeline.

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS, statically exported (SSG)
- **Motion:** polished animations with Framer Motion (animated hero, scroll reveals, page transitions, micro-interactions) — fully honors `prefers-reduced-motion`
- **Resilient UX:** any uncaught error or promise rejection anywhere surfaces a professional glassmorphism toast ("Something went wrong"); route-level + global error boundaries; broken logos fall back gracefully
- **Data:** plain JSON in `/data` (no database)
- **Search:** client-side, instant, powered by Fuse.js
- **Discovery:** a Node pipeline pulls candidates from free sources and classifies them with the **Google Gemini** free tier
- **Automation:** GitHub Actions (free cron) runs discovery every 3 hours
- **Tested:** Playwright end-to-end smoke tests cover rendering, search, the error→toast flow, SEO/JSON-LD, 404, and theme toggle
- **Hosting:** Cloudflare Pages or Vercel free tier

---

## Table of contents

1. [Project structure](#project-structure)
2. [Local setup](#local-setup)
3. [Get a free Gemini API key](#get-a-free-gemini-api-key)
4. [How the discovery pipeline works](#how-the-discovery-pipeline-works)
5. [Day-to-day: the approval workflow](#day-to-day-the-approval-workflow)
6. [GitHub Actions setup](#github-actions-setup)
7. [Deploy to Cloudflare Pages](#deploy-to-cloudflare-pages)
8. [Deploy to Vercel](#deploy-to-vercel)
9. [Editing data by hand](#editing-data-by-hand)
10. [Migrating JSON → Supabase later](#migrating-json--supabase-later)

---

## Project structure

```
axploria/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Homepage (hero, latest, featured, categories)
│   ├── tools/page.tsx        # Full list with search + filters
│   ├── tool/[slug]/page.tsx  # Tool detail (SEO + JSON-LD)
│   ├── category/[slug]/page.tsx
│   ├── submit/page.tsx       # Submission instructions + Tally placeholder
│   ├── sitemap.ts            # /sitemap.xml
│   ├── robots.ts             # /robots.txt
│   ├── error.tsx             # route-level error boundary (animated)
│   ├── global-error.tsx      # last-resort root error boundary
│   ├── template.tsx          # page-transition animation
│   └── layout.tsx, globals.css, not-found.tsx
├── components/               # UI components
│   ├── Toast.tsx             # glassmorphism toast system + useToast()
│   ├── GlobalErrorListener.tsx  # catches any error/rejection → toast
│   ├── Hero.tsx, Reveal.tsx, AnimatedCounter.tsx  # animation
│   ├── Logo.tsx              # logo with graceful favicon fallback
│   └── … (cards, search, theme toggle, grids)
├── lib/                      # types, data access, utilities
├── data/                     # ← all content lives here
│   ├── tools.json            # the live directory (deploys when changed)
│   ├── categories.json       # the 15 categories
│   ├── sources.json          # discovery sources (edit freely)
│   ├── pending.json          # awaiting review (does NOT trigger a deploy)
│   ├── rejected.json         # rejected items (never re-suggested)
│   └── last-run.json         # pipeline timestamp
├── scripts/
│   ├── fetch-tools.mjs       # discovery pipeline (Node, no heavy deps)
│   └── approve.mjs           # interactive y/n/edit approval CLI
├── tests/                    # Playwright e2e smoke tests + static server
├── playwright.config.ts
└── .github/workflows/
    ├── fetch-tools.yml       # runs discovery every 3 hours
    └── notify-pending.yml    # opens a GitHub Issue when tools are pending
```

---

## Local setup

**Prerequisites:** Node.js 18.17+ (Node 20 recommended).

```bash
# 1. Clone
git clone https://github.com/<your-username>/axploria.git
cd axploria

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
#   then edit .env.local — set NEXT_PUBLIC_SITE_URL and GEMINI_API_KEY

# 4. Run the dev server
npm run dev
#   open http://localhost:3000

# 5. Build the static site (outputs to ./out)
npm run build
```

The build produces a fully static site in `./out` — deployable to any static host.

### Environment variables

| Variable               | Used by            | Required | Notes                                                        |
| ---------------------- | ------------------ | -------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Site (build time)  | Yes      | Canonical URLs, sitemap, OpenGraph. No trailing slash.       |
| `GEMINI_API_KEY`       | `fetch-tools.mjs`  | Yes\*    | Only the discovery pipeline. Never shipped to the browser.   |
| `GEMINI_MODEL`         | `fetch-tools.mjs`  | No       | Defaults to `gemini-1.5-flash`.                              |

\* Only required to run the discovery pipeline. The website builds and runs without it.

---

## Get a free Gemini API key

1. Go to **https://aistudio.google.com/app/apikey** and sign in with a Google account.
2. Click **Create API key** (you can use a new or existing Google Cloud project).
3. Copy the key.
4. Locally: put it in `.env.local` as `GEMINI_API_KEY=...`
5. In CI: add it as a repository secret (see [GitHub Actions setup](#github-actions-setup)).

The free tier of `gemini-1.5-flash` is generous; the pipeline adds a delay between
calls and caps candidates per run to stay well within limits.

---

## How the discovery pipeline works

`scripts/fetch-tools.mjs` (run with `npm run fetch`) does the following:

1. **Pulls** new items from the free sources in `data/sources.json`:
   - RSS feeds (Anthropic, OpenAI, Google DeepMind, Meta AI, Mistral, Hugging Face, Stability AI)
   - Hacker News (Algolia API) — recent stories matching `AI` / `launch` / `Show HN` with > 20 points
   - Reddit — `r/artificial/new` and `r/SideProject/new`, filtered to AI-related posts
   - Google News RSS — query `new AI tool launched`
2. **Filters** to items newer than the last run (`data/last-run.json`).
3. **Dedupes** against `tools.json`, `pending.json`, and `rejected.json` by domain and name,
   and drops aggregator/social domains (reddit, HN, YouTube, X, etc.).
4. **Classifies** each candidate with Gemini, which returns strict JSON:
   `{ isAITool, name, url, description (≤25 words), pricing, categories, confidence }`.
5. **Appends** items with `isAITool: true` and `confidence > 0.7` to `data/pending.json`.
6. **Handles errors gracefully** — a single dead feed or failed API call never crashes the
   run; everything is logged and a summary is printed at the end.

Edit `data/sources.json` any time to add/remove feeds — no code changes needed.

---

## Day-to-day: the approval workflow

The pipeline never publishes automatically. New tools land in `data/pending.json`, and
**you** approve them:

```bash
npm run approve
```

For each pending tool you'll see its name, URL, description, pricing, categories, and the
pipeline's confidence. Then choose:

| Key | Action                                                                 |
| --- | ---------------------------------------------------------------------- |
| `y` | **Approve** → moved into `tools.json` (unique slug + id auto-generated) |
| `n` | **Reject** → moved into `rejected.json` (never suggested again)         |
| `e` | **Edit** → tweak name/description/pricing/categories/tags, then approve |
| `s` | **Skip** → leave it in `pending.json` for later                         |
| `q` | **Quit** → saves progress and exits                                    |

After approving, commit the changed `data/tools.json` and push — that triggers a deploy
and the new tools go live:

```bash
git add data/tools.json data/pending.json data/rejected.json
git commit -m "Add reviewed AI tools"
git push
```

> **Why pending changes don't deploy:** the GitHub Action commits `pending.json` /
> `last-run.json` with a `[skip ci]` tag in the commit message. Both Cloudflare Pages and
> Vercel skip builds for commits containing `[skip ci]`. Only your human commits to
> `tools.json` (without that tag) deploy the site.

---

## GitHub Actions setup

Two workflows are included (free for public repos):

- **`fetch-tools.yml`** — runs `scripts/fetch-tools.mjs` every 3 hours (and on manual
  `workflow_dispatch`). It commits any new `pending.json` with `[skip ci]`.
- **`notify-pending.yml`** — after a fetch completes, opens (or updates) a GitHub Issue
  listing the tools awaiting review, so you get a notification.

**Add the Gemini secret:**

1. In your GitHub repo, go to **Settings → Secrets and variables → Actions**.
2. Under **Secrets**, click **New repository secret**.
3. Name: `GEMINI_API_KEY`, Value: your key. Save.
4. _(Optional)_ Under **Variables**, add `GEMINI_MODEL` to override the default model.

**Trigger a run manually:** go to **Actions → Fetch AI Tools → Run workflow**.

> The workflow needs permission to push. This repo's workflow already sets
> `permissions: contents: write`; no extra config is needed for the default `GITHUB_TOKEN`.

---

## Deploy to Cloudflare Pages

Cloudflare Pages serves the static export for free.

1. Push this repo to GitHub.
2. Go to the **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git**.
3. Select your repository.
4. Set the build configuration:
   - **Framework preset:** `Next.js (Static HTML Export)` _(or "None")_
   - **Build command:** `npx next build`
   - **Build output directory:** `out`
5. Add an environment variable:
   - **Variable name:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** your Pages URL, e.g. `https://axploria.pages.dev` (no trailing slash)
6. Click **Save and Deploy**.

Every push to your production branch rebuilds and deploys — **except** commits containing
`[skip ci]`, which Cloudflare Pages skips. That's exactly how the bot's `pending.json`
commits avoid triggering a rebuild while your `tools.json` commits deploy normally.

> After deploying, set `NEXT_PUBLIC_SITE_URL` to your real custom domain (if you add one)
> so canonical URLs and the sitemap are correct, then redeploy.

---

## Deploy to Vercel

1. Push this repo to GitHub and import it at **https://vercel.com/new**.
2. Vercel auto-detects Next.js. Because `next.config.mjs` sets `output: 'export'`, the
   build produces static files automatically — no extra config required.
3. Add the environment variable `NEXT_PUBLIC_SITE_URL` (Project → Settings → Environment
   Variables) set to your deployment URL.
4. Deploy. Vercel also honors `[skip ci]` in commit messages, so bot `pending.json`
   commits won't trigger a production build.

---

## Testing

End-to-end smoke tests live in `tests/` and run against the **real exported build** in
`out/` (served by a tiny static server, so trailingSlash routes behave exactly as in
production).

```bash
npm run build       # produce ./out
npm run test:e2e    # run the Playwright suite
```

By default the suite uses your system-installed **Microsoft Edge** (no browser download
needed — handy on low-disk machines). To use Playwright's bundled Chromium instead, run
`npx playwright install chromium` and set `channel: undefined` in `playwright.config.ts`.

What's covered:

- Home renders the animated hero with **no uncaught JS errors**
- An uncaught error **and** an unhandled promise rejection each surface the
  "Something went wrong" toast (and it can be dismissed)
- `/tools` search filters the grid
- Tool detail page exposes **JSON-LD `SoftwareApplication`** and a `rel="sponsored nofollow"` link
- Unknown routes render the styled 404 page
- The dark/light theme toggle works

> Note on resilience: dismissal of a toast is driven by a real timer (not the progress-bar
> animation), so notifications stay readable even under `prefers-reduced-motion`.

## Editing data by hand

You don't need the pipeline at all — you can curate everything manually.

- **Add a tool:** append an object to `data/tools.json` following this schema:

  ```jsonc
  {
    "id": "41",
    "slug": "my-tool",                 // unique, URL-safe
    "name": "My Tool",
    "description": "One or two neutral sentences.",
    "url": "https://example.com",
    "logo": "",                         // empty = auto favicon; or a path/URL
    "pricing": "freemium",              // free | freemium | paid | free-trial
    "categories": ["productivity"],     // slugs from categories.json
    "tags": ["notes", "ai"],
    "upvotes": 0,
    "featured": false,
    "verified": false,
    "dateAdded": "2026-06-11",          // ISO date
    "source": "manual"                  // manual | auto
  }
  ```

- **Add a category:** append to `data/categories.json` with `slug`, `name`,
  `icon` (a [lucide](https://lucide.dev/icons) PascalCase name), and `description`.
- **Feature a tool:** set `"featured": true`.
- **Mark a tool verified:** set `"verified": true` (shows a check badge).

Commit `tools.json` / `categories.json` and push to deploy.

---

## Migrating JSON → Supabase later

When you outgrow JSON (user accounts, real upvotes, submissions written directly to a DB),
move to **Supabase** (also has a free tier):

1. **Create tables** mirroring the JSON schema:
   ```sql
   create table categories (
     slug text primary key,
     name text not null,
     icon text not null,
     description text
   );

   create table tools (
     id uuid primary key default gen_random_uuid(),
     slug text unique not null,
     name text not null,
     description text,
     url text not null,
     logo text,
     pricing text check (pricing in ('free','freemium','paid','free-trial')),
     tags text[] default '{}',
     upvotes int default 0,
     featured boolean default false,
     verified boolean default false,
     date_added timestamptz default now(),
     source text default 'manual'
   );

   -- many-to-many tool ↔ category
   create table tool_categories (
     tool_id uuid references tools(id) on delete cascade,
     category_slug text references categories(slug) on delete cascade,
     primary key (tool_id, category_slug)
   );
   ```
2. **Seed** by importing the existing `data/*.json` (a short Node script can insert rows
   via `@supabase/supabase-js`).
3. **Swap the data layer:** `lib/data.ts` is the single source of truth for reads. Replace
   its JSON imports with Supabase queries. Because pages call helpers like
   `getToolBySlug`, `getToolsByCategory`, `getLatestTools`, you only change that one file.
   - Keep SSG by fetching in `generateStaticParams` / server components at build time, or
     switch to ISR (`export const revalidate = 3600`) if you move off static export.
4. **Point the pipeline at Supabase:** have `fetch-tools.mjs` insert into a `pending` table
   instead of `pending.json`, and build an admin UI (or keep `approve.mjs` writing via the
   Supabase client) for approvals.
5. **Add upvotes/accounts:** use Supabase Auth + a `votes` table; upvoting becomes a row
   insert with a unique `(user_id, tool_id)` constraint.

The frontend, components, and SEO don't need to change — only `lib/data.ts` and the
pipeline's persistence layer.

---

## License & attribution

Tool names, logos, and trademarks belong to their respective owners. This directory links
out to each tool with `rel="sponsored nofollow"`. Built with Next.js and Tailwind CSS.
