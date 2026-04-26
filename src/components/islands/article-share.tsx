/**
 * ArticleShare — React island for social share buttons (Story 4.5, AC2–AC6)
 *
 * Hydrated via `client:visible` from the Astro wrapper `blog-share-buttons.astro`.
 * All i18n strings are resolved at build time and passed as props — no i18n
 * calls inside this component.
 *
 * Handles:
 *   - WhatsApp share link
 *   - Twitter/X share link (with optional `via` param)
 *   - Copy-to-clipboard with "Copied!" feedback + aria-live announcement
 */
import { useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Inline SVG icons (<=1KB each, aria-hidden, currentColor)
// ---------------------------------------------------------------------------

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TwitterXIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ArticleShareProps {
  title: string;
  url: string;
  twitterHandle?: string;
  labels: {
    shareHeadline: string;
    whatsApp: string;
    twitter: string;
    copyLink: string;
    linkCopied: string;
    ariaWhatsApp: string;
    ariaTwitter: string;
    ariaCopyLink: string;
  };
}

// ---------------------------------------------------------------------------
// Shared button styles
// ---------------------------------------------------------------------------

const buttonBase =
  'inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-divider)] bg-[var(--color-surface)] text-[var(--color-primary)] text-sm font-medium hover:bg-[var(--color-surface-3)] focus-visible:outline-2 focus-visible:outline-[var(--color-teal)] focus-visible:outline-offset-2 motion-safe:transition-[background-color,opacity] motion-safe:duration-[var(--duration-base)]';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ArticleShare({
  title,
  url,
  twitterHandle,
  labels,
}: ArticleShareProps) {
  const [copied, setCopied] = useState(false);

  // Revert "Copied!" after ~2 seconds (AC3)
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  // WhatsApp URL (AC3)
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  // Twitter/X URL with optional via param (AC3, AC5)
  let twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  if (twitterHandle) {
    twUrl += `&via=${encodeURIComponent(twitterHandle)}`;
  }

  // Copy link handler with fallback (AC3)
  async function handleCopy() {
    // TODO(epic-6): trackEvent('blog_share_click', { channel: 'copy_link', postSlug })
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Fallback: select-and-copy from a hidden textarea
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
    }
  }

  return (
    <div className="mt-10 border-t border-[var(--color-divider)] pt-8">
      <p className="font-display mb-4 text-lg font-semibold text-[var(--color-primary)]">
        {labels.shareHeadline}
      </p>

      <nav aria-label="Share this article">
        <div className="flex flex-wrap gap-3">
          {/* WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={labels.ariaWhatsApp}
            className={buttonBase}
            onClick={() => {
              // TODO(epic-6): trackEvent('blog_share_click', { channel: 'whatsapp', postSlug })
            }}
          >
            <WhatsAppIcon />
            <span>{labels.whatsApp}</span>
          </a>

          {/* Twitter/X */}
          <a
            href={twUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={labels.ariaTwitter}
            className={buttonBase}
            onClick={() => {
              // TODO(epic-6): trackEvent('blog_share_click', { channel: 'twitter', postSlug })
            }}
          >
            <TwitterXIcon />
            <span>{labels.twitter}</span>
          </a>

          {/* Copy link */}
          <button
            type="button"
            aria-label={labels.ariaCopyLink}
            className={buttonBase}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon /> : <LinkIcon />}
            <span className="motion-safe:transition-opacity motion-safe:duration-[var(--duration-base)]">
              {copied ? labels.linkCopied : labels.copyLink}
            </span>
          </button>
        </div>

        {/* AC6: aria-live region for screen reader announcement */}
        <span className="sr-only" aria-live="polite" role="status">
          {copied ? labels.linkCopied : ''}
        </span>
      </nav>
    </div>
  );
}
