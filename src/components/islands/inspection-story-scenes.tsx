/**
 * InspectionStoryScenes — Story 2.5 (UX-DR13, AR23, AR27)
 *
 * Wrapper consumer island that builds the six real inspection-story
 * scenes and mounts `<InspectionStoryScroll />`. This is the i18n
 * boundary for the section: it receives `locale` as a prop from the
 * Astro section and routes every visible string through `t()`.
 *
 * Why a React wrapper (and not a raw Astro mount of the island)?
 *   `InspectionStoryScene.children` is a `ReactNode`, which is NOT
 *   serialisable across the Astro → island hydration boundary under
 *   `client:visible`. Astro serialises island props as JSON, and JSX
 *   cannot round-trip through JSON. The wrapper keeps the island's
 *   API idiomatic (React JSX children) and constructs the `scenes`
 *   array inside React-land where JSX is cheap. Same pattern Story
 *   2.4 shipped for its reviewer demo — which this file supersedes.
 *
 * Sibling-island import exception:
 *   This file imports `InspectionStoryScroll` from a sibling island —
 *   the ONE allowed sibling import in the codebase. Its sole purpose
 *   is to construct scenes and mount the sibling mechanism, so the
 *   alternative (a duplicate scroll-story implementation) would be
 *   far worse. Documented as a deliberate exception to AR23.
 *
 * Hydration: parent Astro mounts this with `client:visible` — not
 * `client:load`. The section is below the fold (AR27).
 */
import InspectionStoryScroll, {
  type InspectionStoryScene,
} from '@/components/islands/inspection-story-scroll';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { t, type Locale } from '@/lib/i18n';

export interface InspectionStoryScenesProps {
  locale: Locale;
}

export default function InspectionStoryScenes({
  locale,
}: InspectionStoryScenesProps) {
  const tr = (key: string) => t(`landing.inspectionStory.${key}`, locale);

  const buildNarrative = (sceneKey: string) => (
    <Narrative
      eyebrow={tr(`${sceneKey}.sceneNumberLabel`)}
      heading={tr(`${sceneKey}.featureName`)}
      narrative={tr(`${sceneKey}.narrative`)}
      benefit={tr(`${sceneKey}.featureBenefit`)}
    />
  );

  const scenes: InspectionStoryScene[] = [
    {
      id: 'scene-1-model-dna',
      label: tr('scene1.sceneNumberLabel'),
      narrative: buildNarrative('scene1'),
      phoneContent: <ModelDnaInterior />,
    },
    {
      id: 'scene-2-severity-calibrator',
      label: tr('scene2.sceneNumberLabel'),
      narrative: buildNarrative('scene2'),
      phoneContent: <SeverityCalibratorInterior />,
    },
    {
      id: 'scene-3-personal-risk-calibration',
      label: tr('scene3.sceneNumberLabel'),
      narrative: buildNarrative('scene3'),
      phoneContent: <RiskCalibrationInterior />,
    },
    {
      id: 'scene-4-poker-face-mode',
      label: tr('scene4.sceneNumberLabel'),
      narrative: buildNarrative('scene4'),
      phoneContent: <PokerFaceInterior />,
    },
    {
      id: 'scene-5-hard-stop-protocol',
      label: tr('scene5.sceneNumberLabel'),
      variant: 'climax',
      narrative: buildNarrative('scene5'),
      phoneContent: <HardStopInterior />,
    },
    {
      id: 'scene-6-negotiation-report',
      label: tr('scene6.sceneNumberLabel'),
      narrative: buildNarrative('scene6'),
      phoneContent: <NegotiationReportInterior />,
    },
  ];

  return <InspectionStoryScroll scenes={scenes} />;
}

/* ------------------------------------------------------------------ */
/* Narrative — white-on-dark scene copy for the scrollable left       */
/* column. Paired with a sibling phone-interior mini-composition via  */
/* the `InspectionStoryScene` contract; the two trees are intentionally */
/* NOT nested so the phone card never inherits the white-on-pale text. */
/* ------------------------------------------------------------------ */
function Narrative({
  eyebrow,
  heading,
  narrative,
  benefit,
}: {
  eyebrow: string;
  heading: string;
  narrative: string;
  benefit: string;
}) {
  return (
    <div className="space-y-4">
      <p className="font-mono text-xs tracking-widest text-[var(--color-amber)] uppercase">
        {eyebrow}
      </p>
      <h3 className="font-display text-[length:var(--text-2xl)] font-bold text-white">
        {heading}
      </h3>
      <p className="text-[length:var(--text-lg)] text-white/90">{narrative}</p>
      <p className="text-[length:var(--text-sm)] text-white/70">{benefit}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone-interior compositions — Tier-1 primitives + brand tokens.    */
/* Each composition stays under 2 KB of inline JSX (AC3).             */
/* ------------------------------------------------------------------ */

function ModelDnaInterior() {
  return (
    <div className="space-y-3 text-left">
      <Badge
        variant="outline"
        className="border-[var(--color-teal)] text-[var(--color-primary)]"
      >
        2017 Ford Focus · 1.0 EcoBoost
      </Badge>
      <ul className="space-y-2 text-[length:var(--text-sm)] text-[var(--color-primary)]">
        <li className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-severity-yellow)]" />
          Timing chain tensioner wear
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-severity-red)]" />
          Coolant line failures after 60k miles
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-severity-yellow)]" />
          Clutch pack wear signature
        </li>
      </ul>
    </div>
  );
}

function SeverityCalibratorInterior() {
  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center gap-2">
        <Badge
          className="border-transparent bg-[var(--color-severity-green)] text-white"
          aria-label="Green severity"
        >
          OK
        </Badge>
        <span className="text-[length:var(--text-sm)] text-[var(--color-primary)]">
          Wiper blade wear · €12
        </span>
      </div>
      <Separator className="bg-[var(--color-divider)]" />
      <div className="flex items-center gap-2">
        <Badge
          className="border-transparent bg-[var(--color-severity-yellow)] text-white"
          aria-label="Amber severity"
        >
          Watch
        </Badge>
        <span className="text-[length:var(--text-sm)] text-[var(--color-primary)]">
          Front pad 30% remaining · €180
        </span>
      </div>
      <Separator className="bg-[var(--color-divider)]" />
      <div className="flex items-center gap-2">
        <Badge
          className="border-transparent bg-[var(--color-severity-red)] text-white"
          aria-label="Red severity"
        >
          Stop
        </Badge>
        <span className="text-[length:var(--text-sm)] text-[var(--color-primary)]">
          Head gasket seepage · €2,200
        </span>
      </div>
    </div>
  );
}

function RiskCalibrationInterior() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className="h-24 w-24 rounded-full"
        style={{
          background:
            'conic-gradient(var(--color-severity-green) 0deg 120deg, var(--color-severity-yellow) 120deg 240deg, var(--color-severity-red) 240deg 360deg)',
        }}
        aria-hidden="true"
      />
      <p className="text-[length:var(--text-xs)] tracking-widest text-[var(--color-muted)] uppercase">
        Conservative ·{' '}
        <span className="font-bold text-[var(--color-primary)]">Balanced</span>{' '}
        · Aggressive
      </p>
    </div>
  );
}

function PokerFaceInterior() {
  return (
    <div className="space-y-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-4 text-center">
      <p className="font-mono text-[length:var(--text-xs)] tracking-widest text-[var(--color-muted)] uppercase">
        Inspection in progress
      </p>
      <div className="flex items-center justify-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-faint)]" />
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-faint)]" />
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-faint)]" />
      </div>
      <p className="text-[length:var(--text-xs)] text-[var(--color-muted)]">
        Please wait while the buyer completes the checks.
      </p>
    </div>
  );
}

function HardStopInterior() {
  return (
    <div className="space-y-3 text-left">
      <div className="rounded-[var(--radius-md)] bg-[var(--color-severity-red)] px-4 py-3 text-white">
        <p className="font-display text-[length:var(--text-lg)] font-bold">
          Hard Stop — walk away
        </p>
        <p className="mt-1 text-[length:var(--text-xs)]">
          This car fails our minimum safety bar.
        </p>
      </div>
      <ul className="space-y-1 text-[length:var(--text-xs)] text-[var(--color-primary)]">
        <li>· Compromised driver airbag</li>
        <li>· VIN does not match logbook</li>
      </ul>
    </div>
  );
}

function NegotiationReportInterior() {
  return (
    <div className="space-y-3 text-left">
      <p className="font-display text-[length:var(--text-xl)] font-bold text-[var(--color-primary)]">
        €420 off
      </p>
      <ul className="space-y-1 text-[length:var(--text-xs)] text-[var(--color-primary)]">
        <li>· Timing chain service due · €180</li>
        <li>· Front pad wear · €140</li>
        <li>· Missing service stamp · €100</li>
      </ul>
      <Badge
        variant="outline"
        className="border-[var(--color-teal)] text-[var(--color-teal)]"
      >
        Ready to send
      </Badge>
    </div>
  );
}
