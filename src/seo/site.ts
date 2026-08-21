/**
 * Single source of truth for all SEO metadata.
 *
 * Consumed by three places — keep them in sync by only editing this file:
 *   1. scripts/prerender.mjs  — injects <head> tags + JSON-LD into the prerendered HTML
 *   2. scripts/prerender.mjs  — generates dist/sitemap.xml
 *   3. src/components/RouteMeta.tsx — updates <title>/<meta> on client-side navigation
 *
 * Every claim below must be verifiable on the live site. Do not add benefits,
 * ratings, prices, or affiliations that aren't stated in the page content —
 * unverifiable structured data is a manual-action risk on a financial site.
 */

/** Canonical origin, no trailing slash. Change here and everything follows. */
export const SITE_URL = 'https://www.mynxt.com';

export const SITE_NAME = 'NXT';
export const CONTACT_EMAIL = 'connect@mynxt.com';
export const DEFAULT_OG_IMAGE = '/assets/images/logo-color.png';

/**
 * App store listings. Fill these in and the download buttons on the homepage
 * become real links, and `installUrl` appears in the MobileApplication schema.
 *
 * Leave a string empty and its button renders as a non-clickable image rather
 * than a dead `href="#"` — better for users and it keeps Search Console from
 * reporting a link that goes nowhere.
 *
 * Expected shapes:
 *   APP_STORE_URL = 'https://apps.apple.com/lb/app/<slug>/id<numeric-id>'
 *   PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=<package.name>'
 */
export const APP_STORE_URL = 'https://apps.apple.com/lb/app/nxt-by-am-bank/id6758016416';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ambank_app';

export const SOCIAL_PROFILES = [
  'https://www.facebook.com/share/1avvD7axin',
  'https://www.instagram.com/nxt_leb/',
  'https://x.com/NXT_Leb',
  'https://www.linkedin.com/company/nxt-leb/',
];

export interface RouteSeo {
  /** Route path as registered in App.tsx. Must start with "/". */
  path: string;
  title: string;
  /** Aim for 120-158 chars — longer gets truncated in the SERP. */
  description: string;
  /** Omit for the default. Path relative to site root. */
  ogImage?: string;
  /** ISO date (YYYY-MM-DD) for <lastmod> in the sitemap. */
  lastmod: string;
  /** Excluded from the sitemap and marked noindex. */
  noindex?: boolean;
  /** Breadcrumb trail shown after Home. Omit on the homepage. */
  breadcrumb?: string;
}

export const ROUTES: RouteSeo[] = [
  {
    path: '/',
    title: 'NXT | Digital Wallet, Instant Transfers & Credit Cards',
    description:
      'Send money by location or QR, split bills, top up in seconds and check your balance without logging in. Explore NXT Visa and Mastercard credit cards.',
    lastmod: '2026-08-06',
  },
  {
    path: '/rights-and-duties',
    title: 'Rights and Duties | NXT',
    description:
      'Your rights and duties as an NXT customer: what you can expect from us, what we ask of you, and how to raise a concern about your account or cards.',
    lastmod: '2026-08-06',
    breadcrumb: 'Rights and Duties',
  },
  {
    path: '/terms-and-conditions',
    title: 'Terms and Conditions | NXT',
    description:
      'The terms governing your use of the NXT app, wallet and cards — eligibility, account use, fees, liability and how these terms may change.',
    lastmod: '2026-08-06',
    breadcrumb: 'Terms and Conditions',
  },
  {
    path: '/privacy-policy',
    title: 'Privacy and Cookies Policy | NXT',
    description:
      'How NXT collects, uses and protects your personal data, the cookies we set, and how to exercise your data rights by contacting connect@mynxt.com.',
    lastmod: '2026-08-06',
    breadcrumb: 'Privacy and Cookies',
  },
];

/** Routes that get prerendered but must never be indexed. */
export const NOINDEX_ROUTES: RouteSeo[] = [
  {
    path: '/404',
    title: 'Page Not Found | NXT',
    description: 'The page you are looking for does not exist.',
    lastmod: '2026-08-06',
    noindex: true,
  },
];

export const ALL_ROUTES = [...ROUTES, ...NOINDEX_ROUTES];

export function getRouteSeo(pathname: string): RouteSeo {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return ALL_ROUTES.find((r) => r.path === clean) ?? NOINDEX_ROUTES[0];
}

export function absoluteUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

/* ------------------------------------------------------------------ */
/* Schema.org JSON-LD                                                  */
/* ------------------------------------------------------------------ */

/**
 * Credit cards exactly as presented on the homepage carousel.
 * Mirrors the `creditCards` array in src/pages/Index.tsx — if you change the
 * cards there, change them here too, or the structured data stops matching the
 * visible page (which is what triggers a structured-data manual action).
 */
const CREDIT_CARDS = [
  {
    name: 'NXT Visa Platinum Euro',
    description:
      'Euro credit card with airport lounge access, medical and travel assistance, extended warranty and purchase protection.',
    image: '/assets/images/cards/card-platinum.png',
    currency: 'EUR',
  },
  {
    name: 'NXT MasterCard Titanium',
    description:
      'Travel-oriented credit card with airport lounge access and partner benefits across Booking.com, IHG Hotels & Resorts and Priceless.com.',
    image: '/assets/images/cards/card-titanium.png',
  },
  {
    name: 'NXT Visa Infinite',
    description:
      'Premium credit card with access to over 1,300 airport lounges, concierge service, a dedicated relationship manager and travel insurance.',
    image: '/assets/images/cards/card-infinite.png',
  },
  {
    name: 'NXT Visa LBP',
    description:
      'Everyday Lebanese pound credit card with worldwide Visa acceptance, contactless payments, real-time spend notifications and 24/7 fraud protection.',
    image: '/assets/images/cards/card-classic.png',
    currency: 'LBP',
  },
];

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/assets/images/logo-color.png`,
    },
    // TODO: if NXT is a brand of a licensed bank, add that here — it is a strong
    // trust signal for both Google and answer engines:
    //   parentOrganization: { '@type': 'BankOrCreditUnion', name: '...', url: '...' }
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: CONTACT_EMAIL,
        availableLanguage: ['en'],
      },
    ],
    sameAs: SOCIAL_PROFILES,
  };
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
  };
}

function webPageNode(route: RouteSeo) {
  const url = absoluteUrl(route.path);
  return {
    '@type': route.path === '/' ? 'WebPage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: route.title,
    description: route.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
    dateModified: route.lastmod,
  };
}

function breadcrumbNode(route: RouteSeo) {
  if (!route.breadcrumb) return null;
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(route.path)}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: route.breadcrumb, item: absoluteUrl(route.path) },
    ],
  };
}

/** Whichever store links are configured, in a stable order. */
export function installUrls(): string[] {
  return [APP_STORE_URL, PLAY_STORE_URL].filter(Boolean);
}

function mobileAppNode() {
  return {
    '@type': 'MobileApplication',
    '@id': `${SITE_URL}/#app`,
    name: 'NXT',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'iOS, Android',
    description:
      'NXT is a mobile wallet for sending money by location or QR code, splitting bills, topping up your account and checking your balance without logging in.',
    publisher: { '@id': ORGANIZATION_ID },
    // installUrl appears automatically once the store constants above are set.
    // Still deliberately absent: aggregateRating and offers — both would be
    // fabricated until there are real store listings with real review counts.
    ...(installUrls().length ? { installUrl: installUrls() } : {}),
    featureList: [
      'Transfer by Location',
      'Transfer via QR',
      'Top-up',
      'Bill Split',
      'Quick Balance',
    ],
  };
}

function creditCardNodes() {
  return CREDIT_CARDS.map((card, i) => ({
    '@type': 'CreditCard',
    '@id': `${SITE_URL}/#card-${i}`,
    name: card.name,
    description: card.description,
    image: `${SITE_URL}${card.image}`,
    provider: { '@id': ORGANIZATION_ID },
    ...(card.currency ? { currency: card.currency } : {}),
  }));
}

/**
 * Builds the single @graph JSON-LD block for a route.
 * One script tag per page, all nodes cross-referenced by @id — this is the
 * shape Google's parser handles most reliably.
 */
export function buildJsonLd(route: RouteSeo): string {
  const graph: unknown[] = [organizationNode(), websiteNode(), webPageNode(route)];

  const crumbs = breadcrumbNode(route);
  if (crumbs) graph.push(crumbs);

  if (route.path === '/') {
    graph.push(mobileAppNode());
    graph.push(...creditCardNodes());
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
