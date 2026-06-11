#!/usr/bin/env node
/**
 * Axploria — interactive approval CLI.
 *
 * Walks through data/pending.json one tool at a time. For each:
 *   y = approve  → moved into data/tools.json (slug + id auto-generated)
 *   n = reject   → moved into data/rejected.json (never suggested again)
 *   e = edit     → tweak fields, then approve
 *   s = skip     → leave in pending.json for later
 *   q = quit     → save progress and exit
 *
 * Run: `node scripts/approve.mjs`
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

const rl = createInterface({ input: stdin, output: stdout });

// --- ANSI helpers (purely cosmetic) ---------------------------------------
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

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

function slugify(input) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function uniqueSlug(base, existing) {
  let slug = base || 'tool';
  let n = 2;
  while (existing.has(slug)) slug = `${base}-${n++}`;
  existing.add(slug);
  return slug;
}

function nextId(tools) {
  const max = tools.reduce((m, t) => {
    const n = parseInt(t.id, 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return String(max + 1);
}

const VALID_PRICING = ['free', 'freemium', 'paid', 'free-trial'];

async function ask(question, fallback = '') {
  const answer = (await rl.question(question)).trim();
  return answer || fallback;
}

async function main() {
  const [pending, tools, rejected, categories] = await Promise.all([
    readJson('pending.json', []),
    readJson('tools.json', []),
    readJson('rejected.json', []),
    readJson('categories.json', []),
  ]);

  const validSlugs = new Set(categories.map((c) => c.slug));
  const existingSlugs = new Set([...tools, ...pending].map((t) => t.slug));

  if (pending.length === 0) {
    console.log(`${c.yellow}Nothing to review — pending.json is empty.${c.reset}`);
    rl.close();
    return;
  }

  console.log(`${c.bold}${c.cyan}Axploria approval queue${c.reset}`);
  console.log(`${pending.length} pending tool(s). Commands: ${c.green}y${c.reset}=approve  ${c.red}n${c.reset}=reject  ${c.yellow}e${c.reset}=edit  s=skip  q=quit\n`);
  console.log(`Valid categories: ${c.dim}${[...validSlugs].join(', ')}${c.reset}\n`);

  const remaining = [];
  let approved = 0;
  let rejectedCount = 0;
  let skipped = 0;
  let quit = false;

  for (let i = 0; i < pending.length; i++) {
    const tool = pending[i];

    if (quit) {
      remaining.push(tool);
      continue;
    }

    console.log('─'.repeat(60));
    console.log(`${c.bold}[${i + 1}/${pending.length}] ${tool.name}${c.reset}`);
    console.log(`  ${c.dim}URL       ${c.reset} ${tool.url}  ${c.dim}(${getDomain(tool.url)})${c.reset}`);
    console.log(`  ${c.dim}Desc      ${c.reset} ${tool.description || '(none)'}`);
    console.log(`  ${c.dim}Pricing   ${c.reset} ${tool.pricing}`);
    console.log(`  ${c.dim}Categories${c.reset} ${(tool.categories || []).join(', ') || '(none)'}`);
    if (tool._meta) {
      console.log(
        `  ${c.dim}Discovery ${c.reset} ${tool._meta.discoveredFrom || '?'} ` +
          `${c.dim}(confidence ${Number(tool._meta.confidence ?? 0).toFixed(2)})${c.reset}`,
      );
    }

    const choice = (await ask(`\n  ${c.bold}Approve? [y/n/e/s/q]:${c.reset} `, 's')).toLowerCase()[0];

    if (choice === 'q') {
      quit = true;
      remaining.push(tool);
      continue;
    }

    if (choice === 's') {
      skipped++;
      remaining.push(tool);
      console.log(`  ${c.yellow}↷ skipped${c.reset}`);
      continue;
    }

    if (choice === 'n') {
      rejected.push({
        name: tool.name,
        url: tool.url,
        domain: getDomain(tool.url),
        rejectedAt: new Date().toISOString(),
      });
      rejectedCount++;
      console.log(`  ${c.red}✗ rejected${c.reset}`);
      continue;
    }

    // edit then approve
    let edited = { ...tool };
    if (choice === 'e') {
      console.log(`  ${c.dim}(press Enter to keep the current value)${c.reset}`);
      edited.name = await ask(`    name [${tool.name}]: `, tool.name);
      edited.description = await ask(`    description [${tool.description}]: `, tool.description);
      let pricing = await ask(`    pricing (${VALID_PRICING.join('/')}) [${tool.pricing}]: `, tool.pricing);
      if (!VALID_PRICING.includes(pricing)) {
        console.log(`    ${c.yellow}invalid pricing, keeping "${tool.pricing}"${c.reset}`);
        pricing = tool.pricing;
      }
      edited.pricing = pricing;
      const catsInput = await ask(
        `    categories (comma slugs) [${(tool.categories || []).join(',')}]: `,
        (tool.categories || []).join(','),
      );
      const cats = catsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const invalid = cats.filter((s) => !validSlugs.has(s));
      if (invalid.length) console.log(`    ${c.yellow}ignoring invalid categories: ${invalid.join(', ')}${c.reset}`);
      edited.categories = cats.filter((s) => validSlugs.has(s));
      const tagsInput = await ask(`    tags (comma) [${(tool.tags || []).join(',')}]: `, (tool.tags || []).join(','));
      edited.tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (choice !== 'y') {
      // unrecognized input -> skip to be safe
      skipped++;
      remaining.push(tool);
      console.log(`  ${c.yellow}↷ unrecognized input, skipped${c.reset}`);
      continue;
    }

    // Build the final tool record for tools.json.
    const slug = uniqueSlug(slugify(edited.name), existingSlugs);
    const record = {
      id: nextId(tools),
      slug,
      name: edited.name,
      description: edited.description,
      url: edited.url,
      logo: edited.logo || '',
      pricing: edited.pricing,
      categories: edited.categories || [],
      tags: edited.tags || [],
      upvotes: edited.upvotes || 0,
      featured: false,
      verified: false,
      dateAdded: edited.dateAdded || new Date().toISOString().slice(0, 10),
      source: 'auto',
    };
    tools.push(record);
    approved++;
    console.log(`  ${c.green}✓ approved → /tool/${slug}${c.reset}`);
  }

  // Persist everything.
  await writeJson('tools.json', tools);
  await writeJson('pending.json', remaining);
  await writeJson('rejected.json', rejected);

  console.log('\n' + '─'.repeat(60));
  console.log(`${c.bold}Done.${c.reset}`);
  console.log(`  ${c.green}Approved: ${approved}${c.reset}`);
  console.log(`  ${c.red}Rejected: ${rejectedCount}${c.reset}`);
  console.log(`  ${c.yellow}Skipped/remaining: ${remaining.length}${c.reset}`);
  if (approved > 0) {
    console.log(
      `\n${c.cyan}Commit data/tools.json to deploy the new tools. ` +
        `(Pending/rejected changes won't trigger a rebuild.)${c.reset}`,
    );
  }

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
