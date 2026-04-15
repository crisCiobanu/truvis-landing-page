/**
 * InspectionStoryScroll — React island for the sticky-phone scroll
 * mechanism (Story 2.4, UX-DR12 / UX-DR14 / UX-DR15 / AR23 / AR24 / AR27).
 *
 * One-observer-many-slots Intersection Observer + `$currentScene`
 * nanostore + CSS-only crossfade. The island owns the mechanism only;
 * Story 2.5 passes the six real scenes via the `scenes` prop — this
 * file must not change when Story 2.5 lands.
 *
 * Consumer contract:
 *   <InspectionStoryScroll client:visible scenes={[...]} />
 *
 * - Hydrated with `client:visible` (AR27) because the section is
 *   always below the fold on `/`.
 * - Scene copy is passed as `children` nodes via the `scenes` prop;
 *   the island itself does NOT call `t()` — that happens at the
 *   consumer boundary. Same pattern as Story 2.3's primitives.
 * - State lives in `$currentScene` (nanostore, Story 1.4 pattern)
 *   rather than `useState` so future analytics / debug surfaces can
 *   observe scene changes without prop-drilling.
 *
 * Imports follow AR23: `react`, `@nanostores/react`, `@/lib/*` only.
 * No sibling-island or Tier-2 section imports.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { useStore } from '@nanostores/react';

import {
  $currentScene,
  setCurrentScene,
} from '@/lib/stores/inspection-story-store';

import styles from './inspection-story-scroll.module.css';

export interface InspectionStoryScene {
  /** Stable unique id — used as React `key` on the phone-screen
   * content container so the crossfade replays on scene change. */
  id: string;
  /** Short human-readable label, e.g. "Scene 1 — Walkaround". Used
   * by the progress indicator's screen-reader label. */
  label: string;
  /** Scene copy rendered in the scrollable **left column** (dark
   * primary background). Owns the scene eyebrow, heading, narrative
   * and benefit line — the white-on-dark narrative block. */
  narrative: ReactNode;
  /** Mini-composition rendered **inside the phone screen** (light
   * surface-3 background). Shows the visual-only representation of
   * the scene (badges, severity rows, gauges, etc.) — does NOT
   * duplicate the narrative copy. Also used as the inline phone
   * instance on mobile under the narrative. */
  phoneContent: ReactNode;
  /** Visual-layout override. `'climax'` is used for scene 5 (Hard
   *  Stop Protocol) per UX-DR13 — centred narrative column, severity-
   *  red accent border, subtle sticky-phone scale. Defaults to
   *  `'standard'` when omitted. Story 2.5 owns the climax treatment. */
  variant?: 'standard' | 'climax';
}

export interface InspectionStoryScrollProps {
  scenes: InspectionStoryScene[];
}

export default function InspectionStoryScroll({
  scenes,
}: InspectionStoryScrollProps) {
  const current = useStore($currentScene);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Reset the ref array length so a shorter scenes array does not
    // leave stale refs from a previous mount. Story 2.5 may change
    // the scenes prop; the effect's [scenes] dependency rebinds.
    slotRefs.current = slotRefs.current.slice(0, scenes.length);

    if (typeof IntersectionObserver === 'undefined') {
      // SSR safety: the island renders server-side during the static
      // build. `useEffect` only runs on the client, but we still guard
      // the constructor for paranoia (e.g. older Jest environments).
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = slotRefs.current.indexOf(
            entry.target as HTMLDivElement
          );
          if (index >= 0) {
            setCurrentScene(index);
          }
          // AC8: toggle-and-never-remove the `--entered` class so past
          // scenes stay visible after scrolling past. We use the CSS
          // module's hashed class name directly.
          entry.target.classList.add(styles['scene-slot--entered']);
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    for (const el of slotRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [scenes]);

  const currentScene = scenes[current] ?? scenes[0];
  const isClimaxActive = currentScene?.variant === 'climax';

  return (
    <div className="md:grid md:grid-cols-[1fr_minmax(280px,360px)] md:gap-12">
      {/* Screen-reader-only live counter (AC9). Lives at the top of
          the island — OUTSIDE the desktop-only sticky column — so that
          mobile users (<768px, where the sticky column is `hidden`)
          still receive scene-change announcements as they scroll. The
          visible progress dots below duplicate this information for
          sighted users on desktop. */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Scene {current + 1} of {scenes.length}
        {currentScene?.label ? `: ${currentScene.label}` : ''}
      </span>

      {/* ------------------------------------------------------------ */}
      {/* Left column — scrollable narrative                            */}
      {/* ------------------------------------------------------------ */}
      <div>
        {scenes.map((scene, i) => {
          const variant = scene.variant ?? 'standard';
          const climaxClass =
            variant === 'climax' ? ` ${styles['scene-slot--climax']}` : '';
          return (
            <div
              key={scene.id}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              data-scene-slot
              data-scene-index={i}
              data-scene-variant={variant}
              className={`${styles['scene-slot']}${climaxClass} py-10 md:min-h-[70vh]`}
            >
              {scene.narrative}

              {/* Mobile (<768px): render an inline phone instance under
                 the narrative copy. The sticky phone in the right
                 column is hidden at this breakpoint.

                 Note: the inline mobile phone content is STATIC per
                 scene (no crossfade — each scene has its own phone
                 instance), so we intentionally do NOT mark it as an
                 `aria-live` region. Doing so would create N redundant
                 live regions on mobile duplicating text the narrative
                 column already announces. Scene-change announcements
                 on mobile come from the single sr-only live counter
                 rendered below, which reflects `$currentScene`. */}
              <div className="mt-8 md:hidden" aria-hidden="true">
                <PhoneFrame>
                  <div className={styles['phone-screen-content']}>
                    {scene.phoneContent}
                  </div>
                </PhoneFrame>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Right column — sticky phone (≥768px only)                     */}
      {/* ------------------------------------------------------------ */}
      <div
        className={`hidden md:sticky md:top-[10vh] md:block md:h-[80vh] md:self-start${
          isClimaxActive ? ` ${styles['phone-column--climax']}` : ''
        }`}
      >
        <PhoneFrame>
          <div
            key={currentScene?.id ?? 'empty'}
            role="region"
            aria-live="polite"
            className={styles['phone-screen-content']}
          >
            {currentScene?.phoneContent}
          </div>
        </PhoneFrame>

        {/* Progress indicator (AC9, UX-DR14) */}
        <ol
          aria-label="Inspection story progress"
          className="mt-4 flex items-center justify-center gap-2"
        >
          {scenes.map((scene, i) => (
            <li key={scene.id}>
              <span
                aria-hidden="true"
                className={`block h-2 w-2 rounded-full transition-colors ${
                  i === current
                    ? 'bg-[var(--color-teal)]'
                    : 'bg-[var(--color-divider)]'
                }`}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/**
 * Inline SVG phone frame (AC5, UX-DR12 / UX-DR14).
 *
 * Authored inline so the entire chrome ships with the island JS chunk
 * and does not trigger an extra HTTP fetch. Marked `aria-hidden="true"`
 * because it is purely decorative — screen readers should announce the
 * scene content via the phone-screen region's `aria-live="polite"`.
 *
 * The phone chrome never animates, bounces, or scales (AC5): only the
 * inner scene content crossfades.
 */
function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto aspect-[9/19] w-full max-w-[320px]">
      <svg
        aria-hidden="true"
        viewBox="0 0 180 380"
        className="absolute inset-0 h-full w-full"
      >
        {/* Outer rounded-rect phone outline */}
        <rect
          x="2"
          y="2"
          width="176"
          height="376"
          rx="28"
          fill="var(--color-bg)"
          stroke="var(--color-primary)"
          strokeWidth="4"
        />
        {/* Inner screen area */}
        <rect
          x="10"
          y="18"
          width="160"
          height="344"
          rx="14"
          fill="var(--color-surface-3)"
        />
        {/* Small camera / notch indicator at top */}
        <rect
          x="76"
          y="8"
          width="28"
          height="6"
          rx="3"
          fill="var(--color-primary)"
        />
      </svg>

      {/* Content slot — sits over the SVG's inner-screen rectangle.
          Coordinates match the inner <rect> above (10/18, 160x344). */}
      <div
        className="absolute overflow-hidden rounded-[14px] p-4"
        style={{
          left: '5.56%',
          top: '4.74%',
          right: '5.56%',
          bottom: '4.74%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
