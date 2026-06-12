#!/usr/bin/env node
/**
 * Axploria — automated AI tool discovery pipeline.
 *
 * Pulls fresh items from free sources (RSS, Hacker News, Reddit, Google News),
 * filters to items newer than the last run, dedupes against existing data, asks
 * Groq (an LLM) to classify each candidate, and (by default) auto-publishes
 * high-confidence AI tools straight to data/tools.json — the live site. Set
 * AUTO_PUBLISH=false to route them to data/pending.json for `npm run approve`.
 *
 * No heavy dependencies — native fetch + a tiny RSS parser.
 * Run: `node scripts/fetch-tools.mjs`  (needs GROQ_API_KEY in env)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const LLM_DELAY_MS = 2000; // delay between calls to stay under Groq's free 30 req/min
const CONFIDENCE_THRESHOLD = 0.7;
// Publish discovered tools straight to the live site (data/tools.json) instead of
// queuing them in data/pending.json for manual review. On by default; disable with
// AUTO_PUBLISH=false. Raise CONFIDENCE_THRESHOLD for a stricter auto-publish bar.
const AUTO_PUBLISH = (process.env.AUTO_PUBLISH ?? 'true').toLowerCase() !== 'false';
const MAX_CANDIDATES_PER_RUN = 25; // cap classification calls per run
const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT = 'AxploriaBot/1.0 (+https://axploria.pages.dev)';

// Domains that are aggregators/social — never the tool's own product site.
const BLOCKED_DOMAINS = new Set([
  'reddit.com', 'redd.it', 'news.ycombinator.com', 'ycombinator.com',
  'news.google.com', 'google.com', 'youtube.com', 'youtu.be', 'twitter.com',
  'x.com', 'medium.com', 'substack.com', 'linkedin.com', 'facebook.com',
  't.co', 'bsky.app', 'mastodon.social',
]);

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(join(DATA_DIR, file), 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await writeFile(join(DATA_DIR, file), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, ...(opts.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url) {
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchJson(url, opts) {
  const res = await fetchWithTimeout(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function slugify(input) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/** Next sequential integer id (as a string) for a tools.json record. */
function nextId(tools) {
  const max = tools.reduce((m, t) => {
    const n = parseInt(t.id, 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return String(max + 1);
}

function toMs(dateStr) {
  if (!dateStr) return NaN;
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? NaN : t;
}

// ---------------------------------------------------------------------------
// Tiny RSS / Atom parser (regex-based, no deps)
// ---------------------------------------------------------------------------
function stripCdata(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function getTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decodeEntities(stripCdata(m[1])).trim() : '';
}

function parseFeed(xml) {
  const items = [];
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/g) || [];
  for (const block of blocks) {
    const title = getTag(block, 'title');
    let link = getTag(block, 'link');
    if (!link) {
      const m = block.match(/<link[^>]*href=["']([^"']+)["']/i);
      if (m) link = m[1];
    }
    const date =
      getTag(block, 'pubDate') ||
      getTag(block, 'published') ||
      getTag(block, 'updated') ||
      getTag(block, 'dc:date') ||
      '';
    if (title && link) items.push({ title, url: link.trim(), date });
  }
  return items;
}

// ---------------------------------------------------------------------------
// Source collectors — each is wrapped so one failure never crashes the run
// ---------------------------------------------------------------------------
const AI_REGEX =
  /\bai\b|\ba\.i\.|artificial intelligence|\bgpt\b|\bllm\b|machine learning|chatbot|generative|neural|\bml\b/i;

async function collectRss(feeds, sinceMs, summary) {
  const out = [];
  for (const feed of feeds) {
    try {
      const xml = await fetchText(feed.url);
      const items = parseFeed(xml);
      let kept = 0;
      for (const item of items) {
        const ms = toMs(item.date);
        // Keep if newer than last run, or if the date is unknown (dedup catches dupes).
        if (Number.isNaN(ms) || ms > sinceMs) {
          out.push({ title: item.title, url: item.url, source: feed.name, date: item.date });
          kept++;
        }
      }
      summary.feeds.push(`✓ ${feed.name}: ${kept} new`);
    } catch (err) {
      summary.feeds.push(`✗ ${feed.name}: ${err.message}`);
    }
  }
  return out;
}

async function collectHackerNews(config, sinceMs, summary) {
  if (!config?.enabled) return [];
  const out = [];
  const sinceUnix = Math.floor((Number.isFinite(sinceMs) ? sinceMs : 0) / 1000);
  const minPoints = config.minPoints ?? 20;
  for (const query of config.queries || []) {
    try {
      const url =
        `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}` +
        `&tags=story&numericFilters=points>${minPoints},created_at_i>${sinceUnix}&hitsPerPage=20`;
      const data = await fetchJson(url);
      for (const hit of data.hits || []) {
        const link = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
        if (hit.title) {
          out.push({
            title: hit.title,
            url: link,
            source: `Hacker News “${query}”`,
            date: hit.created_at,
          });
        }
      }
      summary.feeds.push(`✓ Hacker News “${query}”: ${(data.hits || []).length} hits`);
    } catch (err) {
      summary.feeds.push(`✗ Hacker News “${query}”: ${err.message}`);
    }
  }
  return out;
}

async function collectReddit(subs, sinceMs, summary) {
  const out = [];
  for (const sub of subs || []) {
    try {
      const data = await fetchJson(sub.url, { headers: { Accept: 'application/json' } });
      let kept = 0;
      for (const child of data?.data?.children || []) {
        const p = child.data;
        const created = (p.created_utc || 0) * 1000;
        if (created <= sinceMs) continue;
        const text = `${p.title} ${p.selftext || ''}`;
        if (!AI_REGEX.test(text)) continue;
        const link = p.url_overridden_by_dest || p.url;
        if (!link) continue;
        out.push({
          title: p.title,
          url: link,
          source: sub.name,
          date: new Date(created).toISOString(),
        });
        kept++;
      }
      summary.feeds.push(`✓ ${sub.name}: ${kept} AI-related`);
    } catch (err) {
      summary.feeds.push(`✗ ${sub.name}: ${err.message}`);
    }
  }
  return out;
}

async function collectGoogleNews(config, sinceMs, summary) {
  if (!config?.enabled) return [];
  try {
    const url =
      `https://news.google.com/rss/search?q=${encodeURIComponent(config.query)}` +
      `&hl=en-US&gl=US&ceid=US:en`;
    const xml = await fetchText(url);
    const items = parseFeed(xml);
    const out = [];
    for (const item of items) {
      const ms = toMs(item.date);
      if (Number.isNaN(ms) || ms > sinceMs) {
        out.push({ title: item.title, url: item.url, source: 'Google News', date: item.date });
      }
    }
    summary.feeds.push(`✓ Google News: ${out.length} new`);
    return out;
  } catch (err) {
    summary.feeds.push(`✗ Google News: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Groq (LLM) classification
// ---------------------------------------------------------------------------
function stripJsonFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function classify(candidate, categorySlugs) {
  const prompt = `You classify whether a web item is a real, usable AI tool or product that a person can sign up for and use — NOT a news article, blog post, tutorial, research paper, funding announcement, or general company news.

Allowed category slugs (choose 1-3 that best fit): ${categorySlugs.join(', ')}.

Respond with STRICT JSON only (no markdown, no commentary) in exactly this shape:
{"isAITool": boolean, "name": string, "url": string, "description": string, "pricing": "free" | "freemium" | "paid" | "free-trial", "categories": string[], "confidence": number}

Rules:
- "description": max 25 words, neutral and factual, no marketing hype.
- "categories": use ONLY slugs from the allowed list above.
- "confidence": 0 to 1, how sure you are this is a genuine AI tool/product.
- If it is not a usable AI tool, set "isAITool": false and "confidence" accordingly.

Item title: ${candidate.title}
Item URL: ${candidate.url}`;

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: 'You are a precise classifier. Respond with strict JSON only.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  };

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  // Retry transient rate-limit (429) / overload (503) responses with backoff.
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';
      if (!text) throw new Error('empty Groq response');
      return JSON.parse(stripJsonFences(text));
    }

    const detail = await res.text().catch(() => '');
    if ((res.status === 429 || res.status === 503) && attempt < MAX_ATTEMPTS) {
      await sleep(attempt * 8000); // back off 8s, then 16s
      continue;
    }
    const err = new Error(`Groq HTTP ${res.status} ${detail.slice(0, 120)}`);
    err.status = res.status;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const summary = { feeds: [], candidates: 0, classified: 0, added: 0, errors: 0 };
  console.log('🔎 Axploria discovery pipeline starting…\n');

  const [sources, tools, pending, rejected, lastRunData, categories] = await Promise.all([
    readJson('sources.json', {}),
    readJson('tools.json', []),
    readJson('pending.json', []),
    readJson('rejected.json', []),
    readJson('last-run.json', { lastRun: null }),
    readJson('categories.json', []),
  ]);

  const categorySlugs = categories.map((c) => c.slug);
  const validSlugs = new Set(categorySlugs);
  const sinceMs = lastRunData.lastRun ? toMs(lastRunData.lastRun) : 0;
  console.log(
    `Last run: ${lastRunData.lastRun || 'never (first run)'} — collecting newer items.\n`,
  );

  // 1. Gather candidates from all sources (failures isolated per source).
  const gathered = (
    await Promise.all([
      collectRss(sources.rssFeeds || [], sinceMs, summary),
      collectHackerNews(sources.hackerNews, sinceMs, summary),
      collectReddit(sources.reddit, sinceMs, summary),
      collectGoogleNews(sources.googleNews, sinceMs, summary),
    ])
  ).flat();

  console.log('Sources:');
  summary.feeds.forEach((line) => console.log(`  ${line}`));
  console.log('');

  // 2. Build dedup index from existing data.
  const seenDomains = new Set();
  const seenNames = new Set();
  for (const list of [tools, pending, rejected]) {
    for (const t of list) {
      if (t.url) seenDomains.add(getDomain(t.url));
      if (t.name) seenNames.add(normalizeName(t.name));
    }
  }

  // 3. Dedupe candidates (against existing + within this run + blocked domains).
  const unique = [];
  const runDomains = new Set();
  for (const c of gathered) {
    const domain = getDomain(c.url);
    if (!domain || BLOCKED_DOMAINS.has(domain)) continue;
    if (seenDomains.has(domain) || runDomains.has(domain)) continue;
    const nname = normalizeName(c.title);
    if (seenNames.has(nname)) continue;
    runDomains.add(domain);
    unique.push(c);
  }
  summary.candidates = unique.length;
  console.log(`Found ${gathered.length} raw items → ${unique.length} unique new candidates.\n`);

  const candidates = unique.slice(0, MAX_CANDIDATES_PER_RUN);
  if (unique.length > MAX_CANDIDATES_PER_RUN) {
    console.log(
      `⚠ Capping classification at ${MAX_CANDIDATES_PER_RUN} candidates this run ` +
        `(${unique.length - MAX_CANDIDATES_PER_RUN} deferred to next run).\n`,
    );
  }

  // 4. Classify with Groq.
  if (!GROQ_API_KEY) {
    console.log('⚠ GROQ_API_KEY is not set — skipping classification.');
    console.log('  Get a free key at https://console.groq.com/keys, then re-run. last-run.json left unchanged.\n');
    printSummary(summary);
    return;
  }

  if (candidates.length === 0) {
    console.log('No new candidates to classify.\n');
  }

  // Slug uniqueness across everything we might write into (live tools + queue).
  const usedSlugs = new Set([...tools, ...pending].map((t) => t.slug));
  let added = 0;
  let consecutive429 = 0; // bail out early if the Groq free-tier quota is exhausted
  let quotaStopped = false;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    process.stdout.write(`  [${i + 1}/${candidates.length}] ${c.title.slice(0, 60)}… `);
    try {
      const result = await classify(c, categorySlugs);
      summary.classified++;
      consecutive429 = 0;

      if (result.isAITool && typeof result.confidence === 'number' && result.confidence > CONFIDENCE_THRESHOLD) {
        const name = (result.name || c.title).trim();
        const base = slugify(name);
        let slug = base;
        let n = 2;
        while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
        usedSlugs.add(slug);

        const cats = Array.isArray(result.categories)
          ? result.categories.filter((s) => validSlugs.has(s))
          : [];
        const pricing = ['free', 'freemium', 'paid', 'free-trial'].includes(result.pricing)
          ? result.pricing
          : 'freemium';

        const record = {
          // Live records use a sequential numeric id; queued ones keep a unique temp id.
          id: AUTO_PUBLISH ? nextId(tools) : `auto-${Date.now()}-${i}`,
          slug,
          name,
          description: (result.description || '').trim(),
          url: result.url || c.url,
          logo: '',
          pricing,
          categories: cats,
          tags: [],
          upvotes: 0,
          featured: false,
          verified: false,
          dateAdded: new Date().toISOString().slice(0, 10),
          source: 'auto',
        };

        if (AUTO_PUBLISH) {
          tools.push(record);
        } else {
          record._meta = {
            confidence: result.confidence,
            discoveredFrom: c.source,
            originalTitle: c.title,
          };
          pending.push(record);
        }
        added++;
        console.log(`✓ ${AUTO_PUBLISH ? 'published' : 'queued'} (conf ${result.confidence.toFixed(2)})`);
      } else {
        console.log(
          result.isAITool
            ? `– below threshold (conf ${Number(result.confidence).toFixed(2)})`
            : '– not a tool',
        );
      }
    } catch (err) {
      summary.errors++;
      console.log(`✗ ${err.message}`);
      // Repeated 429s mean the free-tier quota is spent — stop and resume next run.
      if (err.status === 429 && ++consecutive429 >= 3) {
        console.log('\n⚠ Groq rate/quota limit hit repeatedly — stopping early; will resume next run.');
        quotaStopped = true;
        break;
      }
    }

    if (i < candidates.length - 1) await sleep(LLM_DELAY_MS);
  }

  summary.added = added;

  // 5. Persist results — published tools go to the live data, queued ones to pending.
  if (added > 0) {
    await writeJson(AUTO_PUBLISH ? 'tools.json' : 'pending.json', AUTO_PUBLISH ? tools : pending);
  }
  // Only advance the cursor on a clean run — if we were cut short by an exhausted
  // quota, leave it so the skipped candidates are re-scanned next run.
  if (!quotaStopped) {
    await writeJson('last-run.json', { lastRun: new Date().toISOString() });
  }

  console.log('');
  printSummary(summary);
}

function printSummary(summary) {
  console.log('─'.repeat(48));
  console.log('Summary');
  console.log(`  Sources checked : ${summary.feeds.length}`);
  console.log(`  Unique candidates: ${summary.candidates}`);
  console.log(`  Classified      : ${summary.classified}`);
  console.log(`  ${AUTO_PUBLISH ? 'Published to site' : 'Queued for review'}: ${summary.added}`);
  console.log(`  Errors          : ${summary.errors}`);
  console.log('─'.repeat(48));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
