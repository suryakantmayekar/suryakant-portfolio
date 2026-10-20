/**
 * Minimal local preview server for this project.
 * - Serves the repo root
 * - Redirects /v2 -> /v2/ so relative CSS/JS paths resolve correctly
 * - Serves index.html for directories
 * - No dependencies
 *
 * Usage: npm run serve            (http://localhost:3000)
 *        PORT=8080 npm run serve
 */
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.scss': 'text/plain; charset=utf-8'
};

function sendFile(res, filePath, req) {
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  if (req.method === 'HEAD') return res.end();
  createReadStream(filePath).pipe(res);
}

function notFound(res, pathname) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(
    `<!doctype html><meta charset="utf-8"><title>404</title>` +
      `<body style="font-family:system-ui;padding:40px;background:#111;color:#eee">` +
      `<h1>404 — Not found</h1><p><code>${pathname.replace(/[<>&]/g, '')}</code></p>` +
      `<p><a style="color:#6d8bff" href="/">Back to the site</a></p>`
  );
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }

  // Block path traversal
  const filePath = normalize(join(ROOT, pathname));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    return notFound(res, pathname);
  }

  if (stat.isDirectory()) {
    // Ensure the URL ends with a slash so relative asset paths resolve
    if (!pathname.endsWith('/')) {
      res.writeHead(301, { Location: pathname + '/' });
      return res.end();
    }

    const index = join(filePath, 'index.html');
    if (existsSync(index)) return sendFile(res, index, req);
    return notFound(res, pathname);
  }

  sendFile(res, filePath, req);
});

server.listen(PORT, () => {
  console.log(`Preview running at http://localhost:${PORT}`);
  console.log(`  main (dark theme)   http://localhost:${PORT}/`);
  console.log(`  v3 (warm archive)   http://localhost:${PORT}/v3/`);
});
