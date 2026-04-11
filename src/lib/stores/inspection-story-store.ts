/**
 * Inspection-story scroll store — Story 2.4 (AC1 / UX-DR12 / AR24)
 *
 * Cross-island state for the `InspectionStoryScroll` island's
 * currently-active scene index. Lives in a nanostore rather than
 * island-local `useState` so Story 2.5 (and future analytics / debug
 * tooling) can observe scene changes without prop-drilling through
 * the island tree (architecture-truvis-landing-page.md §nanostores).
 *
 * Convention (decision 4c, mirrored from `mobile-nav-store.ts`):
 * consumers MUST go through the action functions — never call
 * `$currentScene.set(...)` directly from outside this file. This
 * keeps side effects centralised, makes the store trivially mockable
 * in tests, and is the rule codified by the Story 1.7 ESLint setup.
 */
import { atom } from 'nanostores';

export const $currentScene = atom<number>(0);

export function setCurrentScene(index: number): void {
  $currentScene.set(index);
}

export function resetInspectionStory(): void {
  $currentScene.set(0);
}
