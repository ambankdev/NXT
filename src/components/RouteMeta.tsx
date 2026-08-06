import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteSeo, absoluteUrl, ROUTES } from '@/seo/site';

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Keeps <title>, the description and the canonical URL correct after a
 * client-side navigation.
 *
 * Crawlers never depend on this — every route ships prerendered HTML with its
 * head already filled in (scripts/prerender.mjs). This exists so the browser
 * tab, bookmarks and analytics page-views are right when a visitor moves
 * between routes without a full page load.
 */
export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getRouteSeo(pathname);
    const url = absoluteUrl(seo.path);

    // An unknown path is served the SPA fallback (see vercel.json), so the
    // homepage's indexable head arrives with it. Downgrade it to noindex here
    // so soft 404s never enter the index.
    const known = ROUTES.some((r) => r.path === (pathname.replace(/\/+$/, '') || '/'));
    setMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      known
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, follow'
    );

    document.title = seo.title;
    setMeta('meta[name="description"]', 'name', 'description', seo.description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [pathname]);

  return null;
}
