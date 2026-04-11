# `islands/` — every client-hydrated React component

If a component ships JavaScript to the browser, it lives here. No exceptions. Keeping every hydrated component inside this single folder makes the hydration cost visually obvious in the file tree and lets reviewers audit bundle impact at a glance.

Hydration policy (AR27):

- Prefer `client:idle` and `client:visible` for everything below the fold.
- Reserve `client:load` for above-the-fold, conversion-critical islands only (e.g. waitlist form, hero CTA). Any `client:load` directive on a component outside this folder is a convention violation and will be flagged in code review (see CONTRACT.md → Hydration Policy).
- Keep each island as small as possible — state lives in `src/lib/stores/` (nanostores), not in island-local `useState`, when more than one island cares about it.

Do put: interactive React components (`MobileNav`, `WaitlistForm`, `CategoryFilter`, ...).
Do not put: pure presentational components, Astro components, content readers.

See CLAUDE.md → "Hydration policy" and architecture AR27.
