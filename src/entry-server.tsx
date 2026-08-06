import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { AppRoutes } from './App';

/**
 * Build-time entry point. scripts/prerender.mjs imports this once and calls
 * render() for every route, then writes the resulting HTML to disk.
 *
 * Deliberately does NOT render <Toaster /> — it is a client-only overlay with
 * nothing for a crawler to read, and keeping it out avoids a hydration diff.
 */
/** Re-exported so scripts/prerender.mjs gets the route table from the same bundle. */
export * from './seo/site';

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>
  );
}
