/**
 * Post-build step: turn the SPA into real static HTML, one file per route.
 *
 * Runs after `vite build` (client -> dist/) and `vite build --ssr` (server ->
 * dist-ssr/). For every route it:
 *   1. renders the React tree to an HTML string,
 *   2. injects the route's <head> tags and JSON-LD into dist/index.html,
 *   3. writes dist/<route>/index.html.
 * Finally it writes dist/sitemap.xml from the same route table.
 *
 * Why this matters: Googlebot can execute JavaScript, but GPTBot, ClaudeBot,
 * PerplexityBot and most social-preview fetchers cannot. Without this step they
 * see an empty <div id="root"> and the site is invisible to them.
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SSR_DIST = path.join(ROOT, 'dist-ssr');

// entry-server re-exports everything from src/seo/site.ts, so one import gives
// us both the renderer and the route table — no second SSR entry needed.
const {
  render,
  ALL_ROUTES,
  ROUTES,
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  buildJsonLd,
} = await import(pathToFileURL(path.join(SSR_DIST, 'entry-server.js')).href);

const template = await readFile(path.join(DIST, 'index.html'), 'utf-8');

const escapeAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** JSON-LD sits in a <script> — the only sequence that can break out is "</". */
const escapeJsonLd = (s) => s.replace(/</g, '\\u003c');

function headFor(route) {
  const url = absoluteUrl(route.path);
  const ogImage = `${SITE_URL}${route.ogImage ?? DEFAULT_OG_IMAGE}`;
  const title = escapeAttr(route.title);
  const description = escapeAttr(route.description);

  const robots = route.noindex
    ? '<meta name="robots" content="noindex, follow" />'
    : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />';

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    robots,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:locale" content="en" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@NXT_Leb" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
    `<script type="application/ld+json">${escapeJsonLd(buildJsonLd(route))}</script>`,
  ].join('\n  ');
}

function buildPage(route) {
  const appHtml = render(route.path);

  let html = template;

  // Drop the dev-only defaults so nothing is duplicated, then inject.
  html = html.replace(/\s*<title>[\s\S]*?<\/title>/, '');
  html = html.replace(/\s*<meta\s+name="description"[^>]*>/, '');

  if (!html.includes('<!--app-head-->')) {
    throw new Error('index.html is missing the <!--app-head--> marker');
  }
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('index.html is missing <div id="root"></div>');
  }

  html = html.replace('<!--app-head-->', headFor(route));
  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  return html;
}

/**
 * Writes each route twice: `<route>.html` and `<route>/index.html`.
 *
 * The canonical URL has no trailing slash, so `/terms-and-conditions` must
 * resolve to the prerendered file on every host. Static servers disagree about
 * which form they look for — some try `<path>.html`, some only resolve
 * directories — and whichever one misses falls through to the SPA rewrite and
 * silently serves the homepage's head to a crawler. Emitting both removes the
 * guesswork; the duplicate costs a few KB.
 */
async function writePage(route, html) {
  if (route.path === '/') {
    const outFile = path.join(DIST, 'index.html');
    await writeFile(outFile, html, 'utf-8');
    return 'index.html';
  }

  const slug = route.path.replace(/^\//, '');
  const targets = [path.join(DIST, `${slug}.html`), path.join(DIST, slug, 'index.html')];

  for (const outFile of targets) {
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, html, 'utf-8');
  }
  return `${slug}.html + ${slug}/index.html`;
}

/**
 * <changefreq> and <priority> are deliberately omitted — Google has stated it
 * ignores both. <lastmod> is the one hint it actually uses, so keep the dates
 * in src/seo/site.ts honest.
 */
function buildSitemap() {
  const urls = ROUTES.filter((r) => !r.noindex)
    .map(
      (r) =>
        `  <url>\n    <loc>${absoluteUrl(r.path)}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n  </url>`
    )
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

/* ------------------------------------------------------------------ */

let count = 0;
for (const route of ALL_ROUTES) {
  const written = await writePage(route, buildPage(route));
  console.log(`  prerendered  ${route.path.padEnd(24)} -> dist/${written}`);
  count++;
}

await writeFile(path.join(DIST, 'sitemap.xml'), buildSitemap(), 'utf-8');
console.log(`  sitemap      ${ROUTES.length} urls          -> dist/sitemap.xml`);

// The SSR bundle is a build artifact, not something to deploy.
if (existsSync(SSR_DIST)) await rm(SSR_DIST, { recursive: true, force: true });

console.log(`\n  ${count} routes prerendered.\n`);
