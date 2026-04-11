# `sections/` — Tier 2 landing-page composites

Large Astro components that compose Tier 1 primitives into a complete page region: `HeroSection`, `ProblemSection`, `FaqSection`, `FooterCtaSection`, the site `Header`, `Footer`, and the reusable `SectionEyebrow` pattern. Each section file is a thin shell that pulls content from `lib/content.ts` and renders without client JS unless a child explicitly hydrates.

Do put: full-width page sections, landing-page composites, Astro-only markup.
Do not put: unrelated feature UI, direct `getCollection()` calls, `client:*` directives (delegate to `islands/`).

See CLAUDE.md → "Three-tier component hierarchy" and PRD §Landing Page Composition.
