/**
 * Placeholder demo wrapper for the Story 2.4 reviewer page.
 *
 * Why a wrapper? `InspectionStoryScrollProps.scenes[i].children` is a
 * `ReactNode`, which cannot be serialised across the Astro → island
 * boundary when the island is hydrated with `client:visible`. We keep
 * the island API idiomatic (React JSX children) and build the
 * `scenes` array INSIDE a small React wrapper that is itself the
 * hydrated component. The Astro file only has to mount one serialisable
 * wrapper — zero props.
 *
 * Story 2.5 will replace this wrapper with its own six-scene wrapper
 * (or mount `<InspectionStoryScroll />` from a React component on the
 * real landing page). The island itself remains unchanged.
 */
import InspectionStoryScroll, {
  type InspectionStoryScene,
} from '@/components/islands/inspection-story-scroll';

export default function InspectionStoryPlaceholderDemo() {
  const scenes: InspectionStoryScene[] = [
    {
      id: 'scene-0-placeholder',
      label: 'Scene 0 — Placeholder',
      children: (
        <div className="space-y-4">
          <p className="font-mono text-xs tracking-widest text-[var(--color-teal)] uppercase">
            Scene 0 · Placeholder
          </p>
          <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-[var(--color-primary)]">
            Scroll mechanism under test
          </h2>
          <p className="text-[length:var(--text-lg)] text-[var(--color-primary)]">
            This is a placeholder scene so reviewers can exercise the
            sticky-phone + Intersection Observer + crossfade mechanism
            end-to-end before Story 2.5 ships the real six scenes.
          </p>
        </div>
      ),
    },
  ];

  return <InspectionStoryScroll scenes={scenes} />;
}
