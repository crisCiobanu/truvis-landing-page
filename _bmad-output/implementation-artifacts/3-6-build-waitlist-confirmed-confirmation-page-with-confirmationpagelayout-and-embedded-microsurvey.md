# Story 3.6: Build /waitlist-confirmed confirmation page with ConfirmationPageLayout and embedded MicroSurvey

Status: review

<!-- Validation optional. Run validate-create-story for a quality check before dev-story. -->

## Story

As **a visitor who just submitted the waitlist form**,
I want **to land on a branded confirmation page that acknowledges my signup, lets me share Truvis with friends, and asks a quick optional survey question**,
so that **I feel confident my email was received, I can easily spread the word, and Truvis learns what motivated me to sign up — without blocking or frustrating me**.

## Context & scope

This is the **sixth story of Epic 3** ("Waitlist Capture & Confirmation Flow"). Story 3.4's WaitlistForm navigates to `/waitlist-confirmed?email=<encoded>` on successful submission. This story builds that destination page — a simple, focused confirmation experience with three content blocks: a success acknowledgement with the submitted email, a social share block (WhatsApp + copy link), and a micro-survey React island that posts the visitor's answer back to Loops for drip segmentation.

The page runs fully static (Astro prerendered). The micro-survey island hydrates lazily (`client:visible`) and posts to a new server-side API route (`POST /api/micro-survey`) that updates the Loops contact's `microSurveyAnswer` custom field. The survey is strictly non-blocking: failures are silently swallowed and the visitor always sees a "Thanks" message.

Scope boundaries:
- **In scope:** `src/pages/waitlist-confirmed.astro` (confirmation page), `src/components/islands/micro-survey.tsx` (React island), `src/pages/api/micro-survey.ts` (API route), `tests/api/micro-survey.test.ts` (Vitest unit test), i18n strings under `landing.confirmation.*`, social share block (WhatsApp + copy link), `<noscript>` fallback, XSS-safe email display from query param.
- **Out of scope:** Turnstile re-verification (visitor already passed it on the form), analytics event tracking (Epic 6 — TODO comments only), Sentry error reporting (Epic 7), persistent rate limiting via KV (v1.1), email confirmation/double-opt-in flow (handled entirely by Loops ESP from Story 3.1).

## Acceptance Criteria

### AC1 — Confirmation page layout with BaseLayout, centered content, and email acknowledgement

**Given** UX-DR18 specifies a branded confirmation page at `/waitlist-confirmed`,
**When** I create `src/pages/waitlist-confirmed.astro`,
**Then**

- the page is wrapped in `BaseLayout` and renders at `/waitlist-confirmed` (and `/fr/waitlist-confirmed`, `/de/waitlist-confirmed` via Astro i18n routing from Story 1.6),
- the content area is a centered single-column layout with `max-width: 560px`,
- at the top, a teal-slate checkmark icon is rendered as an inline SVG (`aria-hidden="true"`), total SVG markup is 1KB or less,
- the page has a single `<h1>` wired to i18n key `landing.confirmation.headline` (default: "You're in."), with no skipped heading levels anywhere on the page (UX-DR28),
- below the headline, subtext acknowledges the submitted email address, read from the `?email=<encoded>` query parameter,
- the email value is HTML-escaped for XSS prevention — Astro template expressions (`{}`) auto-escape, so `set:html` is NOT used,
- the email is validated with a basic shape check (contains `@` and `.`) before display; if missing or invalid, the page falls back to generic text wired to i18n key `landing.confirmation.subtextFallback` (default: "Check your inbox for our confirmation email."),
- the subtext with email is wired to i18n key `landing.confirmation.subtext` (default: "We've sent a confirmation email to {email}. Check your inbox."), with the `{email}` placeholder replaced by the sanitised email value,
- the page meta title is "You're in | Truvis" (or locale-appropriate equivalent), with `noindex, nofollow` robots meta tag (confirmation pages should not be indexed).

### AC2 — Confirmation flow integration with WaitlistForm navigation

**Given** Story 3.4's WaitlistForm navigates to `/{localePrefix}waitlist-confirmed?email=<encoded>` on success,
**When** a visitor arrives at the confirmation page,
**Then**

- the page displays immediately — it is a prerendered static page, not a loading state,
- the "Check your inbox" messaging covers the wait time before the Loops double-opt-in email arrives (FR14),
- the page works correctly when accessed directly without the email query param (fallback text is shown),
- the page is fully functional without JavaScript (static Astro content renders; only the micro-survey island requires JS).

### AC3 — Social share block with WhatsApp and copy-link

**Given** UX-DR19 specifies a share block on the confirmation page,
**When** the social share block renders below the subtext,
**Then**

- a section headline reads "Know someone who's car shopping?" wired to i18n key `landing.confirmation.shareHeadline`,
- a WhatsApp share link is rendered: `https://wa.me/?text=${encodeURIComponent(shareMessage)}` where `shareMessage` is from i18n key `landing.confirmation.shareMessage` (default: "I just joined the Truvis waitlist — a used-car inspection app that looks really useful. Check it out: {siteUrl}"), with `{siteUrl}` replaced by `PUBLIC_SITE_URL` from `src/lib/env.ts`,
- the WhatsApp link opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`),
- a "Copy link" button uses `navigator.clipboard.writeText(PUBLIC_SITE_URL)` asynchronously; on success the button label transitions to "Copied!" for approximately 2 seconds before reverting,
- if the Clipboard API fails (e.g. HTTP context, denied permission), a fallback displays the URL as selectable text,
- both interactive elements are keyboard-accessible (Enter and Space activate them) and meet the 44x44px minimum touch target (UX-DR26, NFR21),
- a `// TODO(epic-6): trackEvent('confirmation_share_click', { channel })` comment is placed at each share interaction handler,
- the share block labels ("Share via WhatsApp", "Copy link", "Copied!") are wired to i18n keys under `landing.confirmation.share.*`.

### AC4 — MicroSurvey React island with radio-card UI and non-blocking submit

**Given** FR17 specifies a micro-survey on the confirmation page for drip segmentation,
**When** I create `src/components/islands/micro-survey.tsx`,
**Then**

- the island renders a single-question radio-card form with the question "What brought you here today?" wired to i18n key `landing.confirmation.microSurvey.question`,
- options are passed via an `options` prop (string array); defaults are sourced from i18n key `landing.confirmation.microSurvey.options`: ["Looking for inspection tips", "Been burned before", "A friend recommended Truvis", "Just curious for now", "Other"],
- each option renders as a visually distinct radio-card (border, selected state with teal highlight, keyboard-navigable via arrow keys within the radio group),
- a primary "Send" button (i18n key `landing.confirmation.microSurvey.send`) and a secondary "Skip" ghost link (i18n key `landing.confirmation.microSurvey.skip`) appear below the options,
- the `email` prop is passed from the Astro page (extracted from query param); if email is absent, the island renders nothing (survey requires email correlation),
- the island is hydrated with `client:visible` (below fold — AR27),
- on "Send" click: the selected answer is POSTed to `POST /api/micro-survey` with `{ email, answer }`,
- during submission: the "Send" button shows a spinner,
- on success OR failure: the form is replaced by a confirmation message "Thanks! This helps us help you." wired to i18n key `landing.confirmation.microSurvey.thanks` — failure is silently swallowed (losing a survey answer is acceptable; frustrating the visitor is not),
- on "Skip" click: the form is replaced by the same "Thanks" confirmation message (no API call),
- all radio inputs have proper `<label>` elements, the radio group has `role="radiogroup"` with `aria-labelledby` pointing to the question heading,
- a `<noscript>` fallback wrapping the island slot reads "Thanks for joining!" (i18n key `landing.confirmation.noscriptFallback`) so the page is graceful without JS.

### AC5 — Micro-survey API endpoint with Loops contact update

**Given** the micro-survey needs to persist the answer in Loops for drip segmentation,
**When** I create `src/pages/api/micro-survey.ts`,
**Then**

- the file exports a single `POST` function matching the Astro `APIRoute` signature,
- it accepts a JSON body `{ email: string; answer: string }`,
- it validates that both `email` and `answer` are non-empty strings; returns `400 { ok: false, code: 'validation_error' }` otherwise,
- it calls the Loops "update contact" API to set the `microSurveyAnswer` custom field on the contact identified by email — using `src/lib/loops.ts` (if Story 3.3's `loops.ts` does not expose an `updateContact` function, add one here),
- it reads `LOOPS_API_KEY` via `getRequired('LOOPS_API_KEY')` from `src/lib/env.ts` (NFR12),
- it does NOT re-run Turnstile verification (the visitor already passed it during form submission),
- it implements a soft in-memory rate limit: rejects with `429 { ok: false, code: 'rate_limited' }` if more than 3 updates from the same email arrive within 60 seconds (note: Cloudflare Pages Functions are stateless per-request, so the in-memory Map resets on cold starts — this is acceptable for V1; add `// TODO(v1.1): move rate limiting to Cloudflare KV for persistence`),
- on Loops API success: returns `200 { ok: true, code: 'success' }`,
- on Loops API failure: returns `502 { ok: false, code: 'esp_unavailable' }` — the client ignores this anyway,
- no secret values or internal error details appear in any response body (NFR12).

### AC6 — i18n strings for all three locales

**Given** the project uses Astro built-in i18n with JSON translation files,
**When** I add confirmation-page i18n strings,
**Then**

- `src/i18n/en/landing.json` contains the following keys under `landing.confirmation`:
  - `headline` — "You're in."
  - `subtext` — "We've sent a confirmation email to {email}. Check your inbox."
  - `subtextFallback` — "Check your inbox for our confirmation email."
  - `shareHeadline` — "Know someone who's car shopping?"
  - `shareMessage` — "I just joined the Truvis waitlist — a used-car inspection app that looks really useful. Check it out: {siteUrl}"
  - `share.whatsapp` — "Share via WhatsApp"
  - `share.copyLink` — "Copy link"
  - `share.copied` — "Copied!"
  - `microSurvey.question` — "What brought you here today?"
  - `microSurvey.options` — ["Looking for inspection tips", "Been burned before", "A friend recommended Truvis", "Just curious for now", "Other"]
  - `microSurvey.send` — "Send"
  - `microSurvey.skip` — "Skip"
  - `microSurvey.thanks` — "Thanks! This helps us help you."
  - `noscriptFallback` — "Thanks for joining!"
- `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` mirror all keys with placeholder English values (real translations land in V1.2).

### AC7 — Accessibility and quality compliance

**Given** WCAG 2.1 AA is required (NFR21, NFR24, NFR25),
**When** the confirmation page and micro-survey island are rendered,
**Then**

- the page has a single `<h1>` with no skipped heading levels (UX-DR28),
- the micro-survey radio group has `role="radiogroup"` with `aria-labelledby`,
- every radio input has an associated `<label>`,
- all interactive elements (WhatsApp link, copy button, radio cards, send/skip buttons) meet 44x44px minimum touch target (UX-DR26),
- focus-visible indicators are present on all interactive elements,
- the `<noscript>` fallback renders gracefully when JS is disabled,
- axe-core reports zero violations,
- CI Lighthouse budgets pass (Performance >= 90, Accessibility >= 90, SEO >= 95).

### AC8 — Vitest unit test for micro-survey API route

**Given** the micro-survey API route is testable in isolation,
**When** I create `tests/api/micro-survey.test.ts`,
**Then**

- the test mocks `src/lib/loops.ts`'s `updateContact` function,
- it asserts that a valid `{ email, answer }` body results in a `200` response with `code: 'success'`,
- it asserts that the Loops `updateContact` is called with the correct email and `{ microSurveyAnswer: answer }`,
- it asserts that missing/empty `email` or `answer` returns `400` with `code: 'validation_error'`,
- it asserts that a Loops API failure returns `502` with `code: 'esp_unavailable'`,
- it asserts that the rate limit triggers `429` after 3 rapid requests from the same email.

## Tasks / Subtasks

- [x] **Task 1 — Create `src/pages/waitlist-confirmed.astro` with BaseLayout and centered layout** (AC: 1, 2)
  - [x] T1.1 Import `BaseLayout`, extract `email` from `Astro.url.searchParams`, validate email shape (contains `@` and `.`), HTML-escape via Astro auto-escaping (no `set:html`)
  - [x] T1.2 Render centered `<main>` with `max-w-[560px] mx-auto` and appropriate vertical padding
  - [x] T1.3 Teal-slate checkmark inline SVG: `<svg>` element with `aria-hidden="true"`, circle + checkmark path in teal (`#3D7A8A`), total markup under 1KB
  - [x] T1.4 `<h1>` wired to `t('landing.confirmation.headline')` — "You're in."
  - [x] T1.5 Conditional subtext: if email is valid, render `t('landing.confirmation.subtext')` with `{email}` placeholder replaced; otherwise render `t('landing.confirmation.subtextFallback')`
  - [x] T1.6 Set page `<title>` to "You're in | Truvis" and add `<meta name="robots" content="noindex, nofollow" />`

- [x] **Task 2 — Build social share block** (AC: 3)
  - [x] T2.1 Section headline `<h2>` wired to `t('landing.confirmation.shareHeadline')`
  - [x] T2.2 WhatsApp share link: `<a href="https://wa.me/?text=${encodeURIComponent(shareMessage)}" target="_blank" rel="noopener noreferrer">` with i18n label `landing.confirmation.share.whatsapp`
  - [x] T2.3 "Copy link" button: `<button>` wrapping an Astro `<script>` tag or inline React island for the Clipboard API interaction; `navigator.clipboard.writeText(siteUrl)` in a try/catch; on success, swap label to "Copied!" for ~2s via `setTimeout`; on failure, show fallback selectable text with the URL
  - [x] T2.4 Read `PUBLIC_SITE_URL` via `src/lib/env.ts` for both the share message and copy-link target
  - [x] T2.5 Ensure both interactive elements have `min-h-[44px] min-w-[44px]` touch targets and are keyboard-accessible
  - [x] T2.6 Add `// TODO(epic-6): trackEvent('confirmation_share_click', { channel: 'whatsapp' })` and `// TODO(epic-6): trackEvent('confirmation_share_click', { channel: 'copy_link' })` comments

- [x] **Task 3 — Create `src/components/islands/micro-survey.tsx` React island** (AC: 4)
  - [x] T3.1 Define props: `{ email?: string; question: string; options: string[]; sendLabel: string; skipLabel: string; thanksMessage: string }`
  - [x] T3.2 If `email` prop is falsy, render nothing (return `null`)
  - [x] T3.3 Radio-card UI: `role="radiogroup"` with `aria-labelledby` pointing to question `<h2>` `id`; each option is `<label>` wrapping `<input type="radio">` with visual card styling (border, selected teal highlight)
  - [x] T3.4 State: `useState` for `selectedOption`, `status` (`idle` | `submitting` | `done`)
  - [x] T3.5 "Send" primary button: disabled when no option selected or status is `submitting`; shows spinner during `submitting`
  - [x] T3.6 "Skip" ghost link: on click, sets status to `done` without API call
  - [x] T3.7 Submit handler: `POST /api/micro-survey` with `{ email, answer: selectedOption }`; on success or failure, set status to `done` (always show thanks)
  - [x] T3.8 Done state: render `thanksMessage` text in place of the form

- [x] **Task 4 — Create `src/pages/api/micro-survey.ts` server route** (AC: 5)
  - [x] T4.1 Export single `POST` function matching `APIRoute` signature
  - [x] T4.2 Parse JSON body, validate `email` and `answer` are non-empty strings; return `400` if invalid
  - [x] T4.3 Implement in-memory rate limit Map: `Map<string, number[]>` keyed by email, storing timestamps; reject with `429` if >3 in 60s window; add `// TODO(v1.1): move rate limiting to Cloudflare KV for persistence`
  - [x] T4.4 Call `updateContact(email, { microSurveyAnswer: answer })` from `src/lib/loops.ts` — if `updateContact` doesn't exist yet, add it to `loops.ts` using the Loops API `PUT /v1/contacts/update` endpoint
  - [x] T4.5 Return `200 { ok: true, code: 'success' }` on success, `502 { ok: false, code: 'esp_unavailable' }` on Loops failure
  - [x] T4.6 Read `LOOPS_API_KEY` via `getRequired('LOOPS_API_KEY')` — never `import.meta.env` directly

- [x] **Task 5 — Create `tests/api/micro-survey.test.ts` Vitest unit test** (AC: 8)
  - [x] T5.1 Mock `src/lib/loops.ts` `updateContact` function via `vi.mock`
  - [x] T5.2 Test valid request returns `200` with `code: 'success'` and correct `updateContact` call shape
  - [x] T5.3 Test missing `email` or `answer` returns `400` with `code: 'validation_error'`
  - [x] T5.4 Test Loops failure returns `502` with `code: 'esp_unavailable'`
  - [x] T5.5 Test rate limit: 4th request within 60s from same email returns `429` with `code: 'rate_limited'`

- [x] **Task 6 — Add i18n strings to all three locale files** (AC: 6)
  - [x] T6.1 Add `landing.confirmation.headline`, `landing.confirmation.subtext`, `landing.confirmation.subtextFallback` to `src/i18n/en/landing.json`
  - [x] T6.2 Add `landing.confirmation.shareHeadline`, `landing.confirmation.shareMessage`, `landing.confirmation.share.whatsapp`, `landing.confirmation.share.copyLink`, `landing.confirmation.share.copied` to `src/i18n/en/landing.json`
  - [x] T6.3 Add `landing.confirmation.microSurvey.question`, `landing.confirmation.microSurvey.options` (as JSON array), `landing.confirmation.microSurvey.send`, `landing.confirmation.microSurvey.skip`, `landing.confirmation.microSurvey.thanks` to `src/i18n/en/landing.json`
  - [x] T6.4 Add `landing.confirmation.noscriptFallback` to `src/i18n/en/landing.json`
  - [x] T6.5 Mirror all keys in `src/i18n/fr/landing.json` with placeholder English values
  - [x] T6.6 Mirror all keys in `src/i18n/de/landing.json` with placeholder English values

- [x] **Task 7 — Wire `<noscript>` fallback and embed micro-survey island in page** (AC: 4, 7)
  - [x] T7.1 In `waitlist-confirmed.astro`, embed `<MicroSurvey>` island with `client:visible`, passing `email`, `question`, `options`, `sendLabel`, `skipLabel`, `thanksMessage` props resolved from i18n
  - [x] T7.2 Wrap island slot in `<noscript>` fallback: "Thanks for joining!" from `t('landing.confirmation.noscriptFallback')`

- [x] **Task 8 — Accessibility audit** (AC: 7)
  - [x] T8.1 Verify single `<h1>`, `<h2>` for share block and micro-survey question, no skipped levels
  - [x] T8.2 Verify all interactive elements have focus-visible indicators
  - [x] T8.3 Verify all touch targets meet 44x44px minimum
  - [x] T8.4 Run axe-core and fix any violations

- [x] **Task 9 — Lighthouse CI budget verification** (AC: 7)
  - [x] T9.1 Ensure page passes Performance >= 90, Accessibility >= 90, SEO >= 95
  - [x] T9.2 Verify LCP < 2.5s, CLS < 0.1

## Dev Notes

### Implementation approach

**Email from query param**: The email is read from `Astro.url.searchParams.get('email')` in the Astro frontmatter. Since this page is statically prerendered, the query param is only available at request time if using SSR. However, since the project is `output: 'static'`, the email will need to be read client-side from `window.location.search` or the page needs to be an SSR route. The recommended approach: keep the page static and read the email client-side via a small inline `<script>` that populates a DOM element, OR pass it to the React island. Since the Astro template auto-escapes, the safest approach is to render the fallback text server-side and enhance with the email client-side. Alternatively, if the Astro i18n setup supports dynamic routes, use `export const prerender = false` for this single page to enable server-side query param access.

**Recommendation**: Use `export const prerender = false` in `waitlist-confirmed.astro` to enable server-side rendering for this page only. This allows reading the query param in Astro frontmatter and auto-escaping the email value. Cloudflare Pages Functions will handle this seamlessly (same as the API routes). This avoids client-side DOM manipulation for XSS-sensitive content.

**Copy-link interaction**: The "Copy link" button needs client-side JS for the Clipboard API. Two options: (a) a tiny inline `<script>` in the Astro page, or (b) a small React island. Given the interaction is simple (click → copy → label swap → revert), an inline Astro `<script>` with `querySelector` is simpler and avoids hydrating a React island for a single button. Use `data-copy-link` attribute for targeting.

**Micro-survey radio cards**: Use native `<input type="radio">` elements with custom card-style labels. No need for Radix RadioGroup here — native radio inputs provide keyboard navigation (arrow keys), grouping, and screen reader semantics out of the box. Style the labels as cards with border and background transitions.

**Rate limit in-memory Map**: Since CF Pages Functions are stateless, the Map will be empty on each cold start. For V1 this provides minimal protection against rapid-fire submissions within a single warm instance. The `TODO(v1.1)` comment documents the path to KV-based persistence.

```ts
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 60 seconds
const RATE_LIMIT_MAX = 3;

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(email) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(email, recent);
  return false;
}
```

**Loops updateContact**: If `src/lib/loops.ts` from Story 3.3 does not already export an `updateContact` function, add one:

```ts
export async function updateContact(
  email: string,
  fields: Record<string, string>,
): Promise<{ success: boolean }> {
  const apiKey = getRequired('LOOPS_API_KEY');
  const response = await fetch('https://app.loops.so/api/v1/contacts/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ email, ...fields }),
  });
  return { success: response.ok };
}
```

**Checkmark SVG**: Keep it minimal — a circle with a polyline checkmark:

```html
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
  <circle cx="32" cy="32" r="30" stroke="#3D7A8A" stroke-width="3" fill="#3D7A8A" fill-opacity="0.1" />
  <polyline points="20,34 28,42 44,24" stroke="#3D7A8A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>
```

### Architecture compliance

- **Three-tier hierarchy**: `waitlist-confirmed.astro` is in `src/pages/` (Tier 3). `micro-survey.tsx` is in `src/components/islands/` (Tier 2 React island). The API route is in `src/pages/api/`. No cross-tier violations.
- **Hydration policy (AR27)**: Micro-survey uses `client:visible` (below fold). No `client:load` on this page — everything is below the initial viewport or handled by Astro static rendering.
- **NFR5 (500KB budget)**: The micro-survey island is lightweight (radio inputs + useState + fetch). No heavy dependencies. The page is mostly static HTML.
- **NFR12 (no client-side secrets)**: `LOOPS_API_KEY` is only accessed in the API route via `lib/env.ts`. The client island only calls `/api/micro-survey` — no secrets in the bundle.
- **NFR21 (keyboard accessible)**: Native radio inputs provide arrow-key navigation. Native buttons provide Enter/Space activation. WhatsApp link is a standard `<a>` element.
- **NFR24 (all inputs have labels)**: Every radio input has an associated `<label>` element.
- **NFR25 (Accessibility >= 90)**: Single `<h1>`, proper heading hierarchy, `role="radiogroup"`, `aria-labelledby`, focus indicators, touch targets.
- **UX-DR26 (44x44px touch targets)**: All interactive elements (radio cards, buttons, links) have sufficient padding/min-height.
- **UX-DR28 (single h1, no skipped levels)**: `<h1>` for page title, `<h2>` for share block and micro-survey section.
- **FR17 (micro-survey)**: Survey question with radio options, persisted to Loops `microSurveyAnswer` field.
- **Content access**: i18n strings accessed via `t()` helper from `src/lib/i18n.ts` in the Astro page. React island receives pre-resolved strings as props.
- **Env vars**: `PUBLIC_SITE_URL` read via `src/lib/env.ts` in the Astro frontmatter and passed to the template. `LOOPS_API_KEY` read via `lib/env.ts` server-side only.
- **Cross-island state**: Not needed — the micro-survey island is the only island on the page.

### Dependencies

- **Story 3.1** (Loops audience provisioned with `microSurveyAnswer` custom field)
- **Story 3.3** (`src/lib/loops.ts` exists with Loops API client — may need `updateContact` function added)
- **Story 3.4** (WaitlistForm navigates to `/waitlist-confirmed?email=<encoded>` on success)
- **Story 1.6** (Astro i18n routing generates `/fr/waitlist-confirmed` and `/de/waitlist-confirmed`)
- **Story 1.3/1.7** (focus ring pattern, `sr-only` utility, BaseLayout with skip-to-main)

### Existing patterns to follow

- **React island pattern**: See existing islands in `src/components/islands/` for props interface, export pattern, and `client:visible` embedding.
- **API route pattern**: See `src/pages/api/waitlist.ts` (Story 3.3) for `APIRoute` signature, JSON response shape, and `lib/env.ts` usage.
- **i18n pattern**: See `src/i18n/en/landing.json` for existing key structure under `landing.*` namespace. Use `t()` helper in Astro, pass resolved strings as props to React islands.
- **Focus ring**: `focus-visible:ring-teal` established in Story 1.3.
- **sr-only**: Tailwind utility for visually-hidden content.
- **shadcn/ui Button**: `src/components/ui/button.tsx` — use for "Send" button with default variant and "Skip" with ghost variant.

### Project Structure Notes

New files:

```
src/pages/waitlist-confirmed.astro              <- Confirmation page (SSR for query param access)
src/components/islands/micro-survey.tsx          <- React island (radio-card survey)
src/pages/api/micro-survey.ts                   <- API route (Loops contact update)
tests/api/micro-survey.test.ts                  <- Vitest unit test
```

Modified files:

```
src/i18n/en/landing.json   <- Add landing.confirmation.* keys
src/i18n/fr/landing.json   <- Mirror with placeholder English
src/i18n/de/landing.json   <- Mirror with placeholder English
src/lib/loops.ts           <- Add updateContact() if not already present from Story 3.3
```

### References

- [Source: epics-truvis-landing-page.md#Story 3.6 — Full acceptance criteria and task breakdown]
- [Source: architecture-truvis-landing-page.md#FR17 — Micro-survey on confirmation page]
- [Source: architecture-truvis-landing-page.md#AR27 — Hydration policy, client:visible for below-fold]
- [Source: ux-design-specification#UX-DR18 — Confirmation page layout]
- [Source: ux-design-specification#UX-DR19 — Social share block]
- [Source: ux-design-specification#UX-DR26 — 44x44px minimum touch targets]
- [Source: ux-design-specification#UX-DR28 — Single h1, no skipped heading levels]
- [Source: prd-truvis-landing-page.md#FR14 — Confirmation flow end-to-end]
- [Source: prd-truvis-landing-page.md#FR17 — Micro-survey for drip segmentation]
- [Source: prd-truvis-landing-page.md#NFR12 — No client-side secrets]
- [Source: prd-truvis-landing-page.md#NFR21 — Keyboard accessible]
- [Source: prd-truvis-landing-page.md#NFR24 — All inputs have labels]
- [Source: prd-truvis-landing-page.md#NFR25 — Accessibility >= 90]
- [Source: src/lib/env.ts — Typed env access]
- [Source: src/lib/loops.ts — Loops API client (Story 3.3)]
- [Source: src/pages/api/waitlist.ts — API route pattern reference (Story 3.3)]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
N/A

### Completion Notes List
- Used `export const prerender = false` for SSR query param access (per story recommendation)
- Added `updateContact()` to `src/lib/loops.ts` — accepts apiKey as parameter (not read internally) for testability
- Added `tArray()` helper to `src/lib/i18n.ts` for resolving JSON array i18n keys (survey options)
- Exported `isRateLimited` and `resetRateLimit` from micro-survey API route for test isolation
- Copy-link interaction uses inline Astro `<script>` (not a React island) per story recommendation
- All 10 micro-survey tests pass, all 64 total tests pass
- Build succeeds, astro check 0 errors, eslint 0 new warnings, prettier clean

### File List

New files:
- `src/pages/waitlist-confirmed.astro` — Confirmation page (SSR)
- `src/components/islands/micro-survey.tsx` — MicroSurvey React island
- `src/pages/api/micro-survey.ts` — POST /api/micro-survey API route
- `tests/api/micro-survey.test.ts` — Vitest unit tests (10 tests)

Modified files:
- `src/lib/loops.ts` — Added `updateContact()` function
- `src/lib/i18n.ts` — Added `tArray()` helper for array i18n keys
- `src/i18n/en/landing.json` — Added `landing.confirmation.*` keys
- `src/i18n/fr/landing.json` — Mirrored with placeholder English values
- `src/i18n/de/landing.json` — Mirrored with placeholder English values
