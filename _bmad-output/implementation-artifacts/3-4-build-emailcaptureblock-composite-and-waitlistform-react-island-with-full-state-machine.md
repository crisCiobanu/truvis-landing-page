# Story 3.4: Build EmailCaptureBlock composite and WaitlistForm React island with full state machine

Status: ready-for-dev

## Story

As **a prospective Truvis user visiting the landing page**,
I want **a polished, accessible email capture form embedded at hero, mid-page, and footer CTA positions**,
so that **I can join the waitlist with minimal friction, receive clear feedback on success or error, and trust the experience enough to hand over my email address**.

## Acceptance Criteria

### AC1 — EmailCaptureBlock Astro composite with three variant layouts

**Given** UX-DR16 specifies a reusable EmailCaptureBlock with hero, inline, and footer variants,
**When** I create `src/components/forms/email-capture-block.astro`,
**Then**

- the component accepts typed props: `variant: 'hero' | 'inline' | 'footer'`, `headline?: string`, `trustMicroCopy?: string`, `signupSource: 'hero' | 'mid' | 'footer'`,
- **hero variant**: renders an optional contextual headline above the form (default from i18n key `landing.waitlist.heroHeadline`), lays out horizontally on desktop (email + button side-by-side) and stacked on mobile, renders trust micro-copy below the form (default from i18n key `landing.waitlist.trustMicroCopy` = "No spam. Unsubscribe anytime. We respect your inbox like we respect your budget."),
- **inline variant**: renders a compact single-line layout (email + button side-by-side at all breakpoints), no headline, no trust micro-copy, suitable for a mid-page CTA band,
- **footer variant**: renders on a dark `#2E4057` background with white text, uses a warm-amber (`#F5A623`) submit button, stacked on mobile / horizontal on desktop,
- all three variants embed the same `WaitlistForm` React island from `src/components/islands/waitlist-form.tsx`,
- hero variant uses `client:load` hydration directive (above-fold, conversion-critical per AR27),
- inline and footer variants use `client:visible` hydration directive,
- the variant and signupSource props are passed through to the island.

### AC2 — WaitlistForm React island with form markup

**Given** UX-DR17 defines the WaitlistForm React island requirements,
**When** I create `src/components/islands/waitlist-form.tsx`,
**Then**

- the component accepts props `{ signupSource: 'hero' | 'mid' | 'footer'; className?: string; variant: 'hero' | 'inline' | 'footer' }`,
- the form contains a **hidden honeypot input** with `name="website"`, `tabindex="-1"`, `autocomplete="off"`, `style={{ display: 'none' }}`, `aria-hidden="true"`,
- the form contains a **visible email input** with `type="email"`, `autocomplete="email"`, `inputmode="email"`, `required`, minimum `font-size: 16px` (prevents iOS Safari zoom on focus per UX-DR17),
- the form contains a **submit button** with a loading spinner slot that replaces button text during the `submitting` state,
- all visible text (placeholder, button label, errors) is sourced from i18n keys under `landing.waitlist.*`.

### AC3 — Turnstile lazy injection and invisible widget

**Given** Story 3.2 provisions the Turnstile site key as `PUBLIC_TURNSTILE_SITE_KEY`,
**When** the WaitlistForm island mounts,
**Then**

- the Turnstile script (`https://challenges.cloudflare.com/turnstile/v0/api.js`) is lazily injected via a `<script async defer>` tag appended to `document.head`,
- injection is **idempotent** across multiple island instances via a module-level `let turnstileLoaded = false` flag — subsequent mounts skip injection,
- a hidden Turnstile widget is rendered in invisible managed mode using `window.turnstile.render(containerEl, { sitekey: PUBLIC_TURNSTILE_SITE_KEY, callback: onTokenReady })`,
- the submit button is **disabled** until the Turnstile token resolves (with a visual disabled state — reduced opacity, `cursor-not-allowed`),
- if Turnstile fails to load or times out after 10 seconds, the form shows a toast error using i18n key `landing.waitlist.errors.turnstileFailed` and the submit button remains disabled.

### AC4 — Full state machine (idle / focused / validating / submitting / success / client_error / api_error)

**Given** UX-DR16 and UX-DR23 define form state behaviour,
**When** the user interacts with the form,
**Then**

- **idle**: email input is empty, placeholder visible (i18n key `landing.waitlist.placeholder`), submit button is enabled once Turnstile token is ready,
- **focused**: email input has a teal-slate focus ring via `focus-visible:ring-teal` (consistent with Story 1.3/1.7 pattern),
- **validating**: on blur and on submit, HTML5 validity is checked first, then a regex check (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); if invalid, transitions to `client_error`,
- **client_error**: email input shows a severity-red border, an inline error message appears below the input (i18n key `landing.waitlist.errors.invalidEmail`), the input text is **NOT cleared** (UX-DR23),
- **submitting**: submit button shows a spinner and "Submitting..." text (i18n key `landing.waitlist.submitting`), email input is disabled, a `POST /api/waitlist` request is made with `{ email, signupSource, honeypot: websiteFieldValue, turnstileToken }`,
- **success with `code:'success'`**: navigates to `/waitlist-confirmed?email=<encodeURIComponent(email)>` (respecting locale prefix if not default locale),
- **success with `code:'duplicate'`**: shows an inline message "You're already on the list!" (i18n key `landing.waitlist.errors.duplicate`) below the input, form stays visible, input is re-enabled,
- **api_error**: displays a shadcn Sonner/Toast notification (severity-red background, bottom-centre on mobile, top-right on desktop), maps server error `code` to the corresponding i18n error string under `landing.waitlist.errors.*`, re-enables the input, preserves user-entered text (UX-DR23), and refreshes the Turnstile token for retry.

### AC5 — i18n strings for all three locales

**Given** the project uses Astro built-in i18n with JSON translation files,
**When** I add waitlist-related i18n strings,
**Then**

- `src/i18n/en/landing.json` contains the following keys under `landing.waitlist`:
  - `heroHeadline` — contextual headline for hero variant
  - `placeholder` — email input placeholder text (e.g. "Enter your email address")
  - `submit` — submit button label (e.g. "Join the Waitlist")
  - `submitting` — submit button loading label (e.g. "Submitting...")
  - `trustMicroCopy` — "No spam. Unsubscribe anytime. We respect your inbox like we respect your budget."
  - `emailLabel` — visible label text for the email input (e.g. "Email address")
  - `errors.invalidEmail` — "Please enter a valid email address."
  - `errors.duplicate` — "You're already on the list!"
  - `errors.turnstileFailed` — "Security verification failed. Please refresh and try again."
  - `errors.espUnavailable` — "Our email service is temporarily unavailable. Please try again in a moment."
  - `errors.serverError` — "Something went wrong. Please try again."
  - `errors.honeypotTriggered` — reserved for server-side logging only; not displayed to users
- `src/i18n/fr/landing.json` and `src/i18n/de/landing.json` mirror all keys with placeholder English values (real translations land in V1.2).

### AC6 — Full accessibility compliance

**Given** WCAG 2.1 AA is required (NFR21, NFR24, NFR25),
**When** the form is rendered in any variant,
**Then**

- the email input has an associated `<label>` — **visible** in the hero variant, **visually-hidden** (`sr-only`) in inline and footer variants,
- the form is keyboard-submittable via the Enter key,
- during `client_error` state, the email input has `aria-invalid="true"` and the error message is associated via `aria-describedby`,
- during `submitting` state, a visually-hidden region with `aria-live="polite"` announces "Submitting..." to screen readers,
- all interactive elements (input, button) meet the 44x44px minimum touch target (UX-DR26),
- axe-core reports zero violations on the demo page,
- a `TODO(epic-6): trackEvent('waitlist_signup', {signupSource})` comment is placed at the success branch for future analytics wiring.

### AC7 — Demo page renders all three variants

**Given** the project uses `_demo/` pages for component verification,
**When** I create `src/pages/_demo/email-capture.astro`,
**Then**

- the page renders all three `EmailCaptureBlock` variants (hero, inline, footer) with distinct `signupSource` values (`'hero'`, `'mid'`, `'footer'`),
- each variant is visually separated with a section heading identifying the variant name,
- the page is accessible at `/demo/email-capture` during local development,
- the demo page imports `BaseLayout` and follows existing `_demo/` page conventions.

## Tasks / Subtasks

- [ ] **Task 1 — Create `src/components/forms/email-capture-block.astro` with three variant layouts** (AC: 1)
  - [ ] T1.1 Define typed props interface: `variant`, `headline?`, `trustMicroCopy?`, `signupSource`
  - [ ] T1.2 Hero variant: contextual headline above form, horizontal layout on desktop (flex-row), stacked on mobile (flex-col), trust micro-copy below
  - [ ] T1.3 Inline variant: compact single-line layout (email + button side-by-side at all breakpoints), no headline, no trust copy
  - [ ] T1.4 Footer variant: dark `bg-[#2E4057]` background, white text, amber `bg-[#F5A623]` submit button override via CSS variable or class
  - [ ] T1.5 Conditionally render `client:load` for hero variant, `client:visible` for inline/footer — use Astro conditional rendering pattern (separate `<WaitlistForm>` tags per branch, since `client:*` directives cannot be dynamic expressions)
  - [ ] T1.6 Pass `variant`, `signupSource`, and any variant-specific className to the island

- [ ] **Task 2 — Create `src/components/islands/waitlist-form.tsx` with form markup** (AC: 2)
  - [ ] T2.1 Define props type: `{ signupSource: 'hero' | 'mid' | 'footer'; className?: string; variant: 'hero' | 'inline' | 'footer' }`
  - [ ] T2.2 Hidden honeypot field: `<input name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />`
  - [ ] T2.3 Email input: `type="email"`, `autoComplete="email"`, `inputMode="email"`, `required`, `className` with `text-[16px]` minimum (iOS zoom prevention)
  - [ ] T2.4 Submit button with conditional content: default label vs. spinner + "Submitting..." text based on state
  - [ ] T2.5 Spinner component: inline SVG or Tailwind animate-spin on a small circle, sized to match button text

- [ ] **Task 3 — Implement Turnstile lazy script injection** (AC: 3)
  - [ ] T3.1 Module-level `let turnstileLoaded = false` and `let turnstileScriptPromise: Promise<void> | null = null` for idempotent loading
  - [ ] T3.2 `loadTurnstileScript()` function: creates `<script>` tag, appends to `document.head`, returns a promise that resolves on script `onload` and rejects on `onerror` or 10s timeout
  - [ ] T3.3 On island mount (`useEffect`), call `loadTurnstileScript()`, then call `window.turnstile.render(containerRef, { sitekey, callback, 'error-callback' })` in invisible managed mode
  - [ ] T3.4 Store Turnstile token in component state; set submit button disabled until token is non-null
  - [ ] T3.5 On Turnstile error or timeout, dispatch `turnstile_failed` action and show toast

- [ ] **Task 4 — Implement state machine with `useReducer`** (AC: 4)
  - [ ] T4.1 Define state type: `{ status: 'idle' | 'focused' | 'validating' | 'submitting' | 'success' | 'client_error' | 'api_error'; email: string; errorMessage: string | null; turnstileToken: string | null }`
  - [ ] T4.2 Define action types: `FOCUS`, `BLUR_VALIDATE`, `SET_EMAIL`, `SUBMIT`, `SUBMIT_SUCCESS`, `SUBMIT_DUPLICATE`, `SUBMIT_ERROR`, `SET_TURNSTILE_TOKEN`, `TURNSTILE_FAILED`, `CLEAR_ERROR`
  - [ ] T4.3 Client-side email validation: HTML5 `validity.valid` check + regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` on blur and on submit; invalid triggers `client_error` with `invalidEmail` message
  - [ ] T4.4 Submit handler: check honeypot field (if filled, silently fake success — navigate to confirmed page), attach Turnstile token, POST to `/api/waitlist` with JSON body `{ email, signupSource, honeypot, turnstileToken }`
  - [ ] T4.5 Success handling: if response `code === 'success'`, navigate to `/{localePrefix}waitlist-confirmed?email=<encoded>`; if `code === 'duplicate'`, dispatch `SUBMIT_DUPLICATE`
  - [ ] T4.6 Error handling: dispatch `SUBMIT_ERROR` with mapped i18n error string, show Sonner toast, call `window.turnstile.reset()` to refresh token for retry
  - [ ] T4.7 Preserve user input on all error states (never clear the email field on error)

- [ ] **Task 5 — Add i18n strings to all three locale files** (AC: 5)
  - [ ] T5.1 Add `landing.waitlist.heroHeadline`, `landing.waitlist.placeholder`, `landing.waitlist.submit`, `landing.waitlist.submitting`, `landing.waitlist.emailLabel` to `src/i18n/en/landing.json`
  - [ ] T5.2 Add `landing.waitlist.trustMicroCopy` to `src/i18n/en/landing.json`
  - [ ] T5.3 Add `landing.waitlist.errors.invalidEmail`, `errors.duplicate`, `errors.turnstileFailed`, `errors.espUnavailable`, `errors.serverError`, `errors.honeypotTriggered` to `src/i18n/en/landing.json`
  - [ ] T5.4 Mirror all keys in `src/i18n/fr/landing.json` with placeholder English values
  - [ ] T5.5 Mirror all keys in `src/i18n/de/landing.json` with placeholder English values

- [ ] **Task 6 — Accessibility audit and wiring** (AC: 6)
  - [ ] T6.1 Email input label: visible `<label>` in hero variant, `<label className="sr-only">` in inline/footer — controlled by variant prop
  - [ ] T6.2 Wire `aria-invalid="true"` on email input when state is `client_error`
  - [ ] T6.3 Wire `aria-describedby` on email input pointing to the error message element's `id`
  - [ ] T6.4 Add `aria-live="polite"` region that shows "Submitting..." text during `submitting` state (visually hidden via `sr-only`)
  - [ ] T6.5 Ensure Enter key submits the form (native `<form>` + `<button type="submit">` behaviour — no custom key handler needed)
  - [ ] T6.6 Ensure input and button meet 44x44px minimum touch target via padding/min-height
  - [ ] T6.7 Run axe-core on the demo page and fix any violations

- [ ] **Task 7 — Create `src/pages/_demo/email-capture.astro` demo page** (AC: 7)
  - [ ] T7.1 Import `BaseLayout` and `EmailCaptureBlock`
  - [ ] T7.2 Render hero variant with `signupSource="hero"`
  - [ ] T7.3 Render inline variant with `signupSource="mid"`
  - [ ] T7.4 Render footer variant with `signupSource="footer"`
  - [ ] T7.5 Add section headings between variants for visual separation

- [ ] **Task 8 — Add analytics TODO comment** (AC: 6)
  - [ ] T8.1 Add `// TODO(epic-6): trackEvent('waitlist_signup', { signupSource })` at the success branch in the submit handler

## Dev Notes

### Implementation approach

**State machine**: Use `useReducer` with a typed discriminated union for actions. This is cleaner than multiple `useState` calls and makes state transitions explicit and testable. No external state machine library needed.

**Turnstile script loading**: The module-level idempotent pattern prevents duplicate script injection when multiple WaitlistForm islands mount on the same page (hero + mid + footer). The promise-based approach ensures all islands share the same loading state:

```ts
let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (turnstileScriptPromise) return turnstileScriptPromise;
  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed to load'));
    document.head.appendChild(script);
    setTimeout(() => reject(new Error('Turnstile script timeout')), 10_000);
  });
  return turnstileScriptPromise;
}
```

**Hydration directive branching**: Astro does not support dynamic `client:*` directives. The Astro composite must use separate render branches:

```astro
{variant === 'hero' ? (
  <WaitlistForm client:load signupSource={signupSource} variant={variant} />
) : (
  <WaitlistForm client:visible signupSource={signupSource} variant={variant} />
)}
```

**Sonner toast positioning**: shadcn/ui includes Sonner. The `<Toaster>` component should already be in the layout (or added by this story). Position is controlled via the `position` prop — use `"bottom-center"` and apply CSS media queries or a responsive prop to switch to `"top-right"` on desktop. Alternatively, use the default and accept the library's responsive behaviour.

**Honeypot silent success**: If the honeypot field is filled (bot detected), the form should silently fake a success by navigating to the confirmation page. This prevents bots from detecting they've been caught. The server-side route (Story 3.3) also checks the honeypot, but the client-side check provides an extra layer.

**iOS zoom prevention**: Safari on iOS zooms the viewport when an input with `font-size < 16px` receives focus. The email input must have `text-base` (16px) or larger. This is enforced via Tailwind class, not inline style.

**Email regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` is intentionally simple for client-side UX. The server (Story 3.3) performs the real validation. Client-side validation is purely for fast user feedback.

**Locale-aware navigation**: On success, the navigation target must respect the current locale prefix. If the user is on `/fr/`, navigate to `/fr/waitlist-confirmed?email=...`. Read the locale from `document.documentElement.lang` or from the page's URL pathname prefix.

**Error code mapping**: The API route (Story 3.3) returns JSON with a `code` field. Map codes to i18n keys:

| Server code | i18n key | Displayed |
|-------------|----------|-----------|
| `success` | — | Navigates away |
| `duplicate` | `landing.waitlist.errors.duplicate` | Inline message |
| `turnstile_failed` | `landing.waitlist.errors.turnstileFailed` | Toast |
| `esp_unavailable` | `landing.waitlist.errors.espUnavailable` | Toast |
| `validation_error` | `landing.waitlist.errors.invalidEmail` | Toast |
| `server_error` | `landing.waitlist.errors.serverError` | Toast |

### Architecture compliance

- **Three-tier hierarchy**: `email-capture-block.astro` is in `src/components/forms/` (Tier 2), `waitlist-form.tsx` is in `src/components/islands/` (React island). Both are Tier 2. Pages consume them at Tier 3. Neither imports from Tier 2 peers. Tier 1 (`ui/`) is used for primitives only.
- **Hydration policy (AR27)**: `client:load` only for hero variant (above-fold, conversion-critical). Inline and footer use `client:visible`. No `client:load` outside `src/components/islands/`.
- **NFR5 (500KB budget)**: Turnstile script is lazy-loaded on island mount, not preloaded. The island itself is small (form + useReducer). No heavy dependencies.
- **NFR12 (no client-side secrets)**: Only `PUBLIC_TURNSTILE_SITE_KEY` is exposed to the client. `LOOPS_API_KEY` is never referenced in client code.
- **NFR21 (keyboard accessible)**: Native `<form>` + `<button type="submit">` provides Enter-to-submit. Tab order is natural (email → button).
- **NFR24 (all inputs have labels)**: Every `<input>` has an associated `<label>` — visible in hero, `sr-only` in inline/footer.
- **UX-DR16 (no user-facing friction)**: Inline validation on blur (not on every keystroke), preserve text on error, clear inline errors when user resumes typing.
- **UX-DR23 (never clear user input on error)**: All error states preserve the email field value. Only `success` clears state (by navigating away).
- **UX-DR26 (44x44px touch targets)**: Input and button have sufficient padding/min-height.
- **UX-DR29 (teal focus ring)**: Email input uses `focus-visible:ring-teal` class, consistent with Story 1.3/1.7 established pattern.
- **Content access**: i18n strings are accessed via `t()` helper from `src/lib/i18n.ts` in the Astro composite. The React island receives pre-resolved strings as props or uses a client-compatible i18n approach.
- **Env vars**: `PUBLIC_TURNSTILE_SITE_KEY` is read via `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY` inside the island (this is permitted for `PUBLIC_*` vars in client code per Astro convention) or passed as a prop from the Astro layer via `src/lib/env.ts`.
- **Cross-island state**: Not needed for this story — each WaitlistForm island is independent. If future stories need shared waitlist state (e.g., "already submitted" across islands), a nanostore in `src/lib/stores/` would be the mechanism.

### Dependencies

- **Story 3.2** (Turnstile site key provisioned as `PUBLIC_TURNSTILE_SITE_KEY` in CF Pages env vars and `.env`)
- **Story 3.3** (API route `POST /api/waitlist` exists and returns JSON with `code` field)
- **Story 1.3/1.7** (focus ring pattern, sr-only utility, BaseLayout with skip-to-main)
- **Story 2.9** (CTA placeholder slots with `data-cta-slot` — Story 3.5 will swap these with `EmailCaptureBlock`)

### Existing patterns to follow

- **React island pattern**: See `src/components/islands/faq-accordion.tsx` for props interface, export pattern, and how Astro embeds it with `client:visible`.
- **Focus ring**: `focus-visible:ring-teal` established in Story 1.3.
- **sr-only**: Tailwind utility for visually-hidden content, used throughout for accessibility.
- **shadcn/ui Button**: `src/components/ui/button.tsx` — use for the submit button with appropriate variant.
- **shadcn/ui Input**: `src/components/ui/input.tsx` — use for the email input, extending with required props.
- **Sonner Toast**: `src/components/ui/sonner.tsx` — import `toast` from `sonner` for error notifications.

### Project Structure Notes

New files:

```
src/components/forms/email-capture-block.astro   ← Tier 2 Astro composite (three variants)
src/components/islands/waitlist-form.tsx          ← React island (state machine, Turnstile, form)
src/pages/_demo/email-capture.astro              ← Demo page rendering all three variants
```

Modified files:

```
src/i18n/en/landing.json   ← Add landing.waitlist.* keys
src/i18n/fr/landing.json   ← Mirror with placeholder English
src/i18n/de/landing.json   ← Mirror with placeholder English
```

Potentially modified:

```
src/layouts/BaseLayout.astro   ← May need <Toaster> from Sonner if not already present
```

### References

- [Source: architecture-truvis-landing-page.md#AR27 — Hydration policy, client:load reserved for above-fold conversion-critical islands]
- [Source: epics-truvis-landing-page.md#Story 3.4 — Full acceptance criteria and task breakdown]
- [Source: ux-design-specification#UX-DR16 — Reusable EmailCaptureBlock with three variants]
- [Source: ux-design-specification#UX-DR17 — WaitlistForm React island, 16px min font]
- [Source: ux-design-specification#UX-DR23 — Never clear user input on error]
- [Source: ux-design-specification#UX-DR26 — 44x44px minimum touch targets]
- [Source: ux-design-specification#UX-DR29 — Teal focus ring]
- [Source: prd-truvis-landing-page.md#FR12-FR17 — Waitlist capture functional requirements]
- [Source: prd-truvis-landing-page.md#NFR5 — 500KB initial weight budget]
- [Source: prd-truvis-landing-page.md#NFR12 — No client-side secrets]
- [Source: prd-truvis-landing-page.md#NFR21 — Keyboard accessible]
- [Source: prd-truvis-landing-page.md#NFR24 — All inputs have labels]
- [Source: src/components/islands/faq-accordion.tsx — React island pattern reference]
- [Source: src/components/ui/button.tsx — shadcn/ui Button primitive]
- [Source: src/components/ui/sonner.tsx — Sonner toast integration]

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
