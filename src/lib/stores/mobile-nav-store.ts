/**
 * Mobile navigation drawer store — Story 1.4 (AC2)
 *
 * Cross-island state for the header's mobile nav drawer. Astro's header
 * renders a plain `<button>` that mounts the `<MobileNav client:idle />`
 * React island; both sides need to agree on whether the drawer is open,
 * so the open/closed flag lives in a nanostore rather than React state
 * (AR24, architecture-truvis-landing-page.md §nanostores).
 *
 * Convention (decision 4c): consumers MUST go through the action
 * functions — never call `.set()` on the exported atom directly. This
 * keeps side effects centralised and makes the store trivially mockable
 * in tests. Story 1.7 will codify the rule in ESLint.
 */
import { atom } from 'nanostores';

export const $mobileNavOpen = atom<boolean>(false);

export function openMobileNav(): void {
  $mobileNavOpen.set(true);
}

export function closeMobileNav(): void {
  $mobileNavOpen.set(false);
}

export function toggleMobileNav(): void {
  $mobileNavOpen.set(!$mobileNavOpen.get());
}
