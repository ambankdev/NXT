interface StoreButtonProps {
  /** Store listing URL. Empty string renders a non-clickable badge. */
  href: string;
  className: string;
  image: string;
  alt: string;
}

const BADGE_CLASSES =
  'block bg-white rounded-xl overflow-hidden shadow-lg w-64 h-24';

/**
 * App Store / Google Play badge.
 *
 * Falls back to a plain image while the store URL is unset, instead of the
 * `href="#"` it used to be — a dead anchor scrolls the page to the top, looks
 * broken to anyone who clicks it, and gets flagged as a link to nowhere.
 * Set APP_STORE_URL / PLAY_STORE_URL in src/seo/site.ts to activate it.
 */
export default function StoreButton({ href, className, image, alt }: StoreButtonProps) {
  const img = <img src={image} alt={alt} className="w-full h-full object-cover" />;

  if (!href) {
    return (
      <div className={`${className} ${BADGE_CLASSES} opacity-90`} aria-label={`${alt} — coming soon`}>
        {img}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} ${BADGE_CLASSES} hover:bg-gray-50 transition-colors`}
    >
      {img}
    </a>
  );
}
