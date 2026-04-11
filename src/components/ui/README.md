# `ui/` — Tier 1 primitives (shadcn/ui)

Low-level, unopinionated building blocks (Button, Dialog, Sheet, Input, Accordion, ...) copied from the shadcn/ui generator and painted with Truvis brand tokens. These primitives MUST NOT contain business logic, content strings, analytics, or feature flags — they are the design-system bedrock that `sections/`, `forms/`, and `blog/` compose.

Do put: Radix-backed primitives, `cva` variants, small `forwardRef` wrappers.
Do not put: section layouts, marketing copy, nanostore reads, `client:load` islands, i18n strings.

See architecture AR23 (three-tier hierarchy) and `CLAUDE.md` → "Architectural boundaries".
