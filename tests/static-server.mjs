// Minimal static file server for the exported `out/` directory.
// Used by Playwright to test the real production build (handles trailingSlash routes).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../out', import.meta.url));
const PORT = Number(process.env.PORT) || 4321;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

async function exists(p) {
  try {
    const s = await stat(p);
    return s.isFile();
  } catch {
    return false;
  }
}

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const candidates = [];
  if (clean.endsWith('/')) {
    candidates.push(join(root, clean, 'index.html'));
  } else {
    candidates.push(join(root, clean));
    candidates.push(join(root, `${clean}.html`));
    candidates.push(join(root, clean, 'index.html'));
  }
  for (const c of candidates) {
    if (await exists(c)) return { file: c, status: 200 };
  }
  return { file: join(root, '404.html'), status: 404 };
}

createServer(async (req, res) => {
  const { file, status } = await resolveFile(req.url || '/');
  try {
    const data = await readFile(file);
    res.writeHead(status, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(PORT, () => {
  console.log(`Serving out/ on http://localhost:${PORT}`);
});
