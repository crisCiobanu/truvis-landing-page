# `forms/` — Tier 2 form composites

Form-shaped Tier 2 composites: `EmailCaptureBlock`, waitlist form shells, micro-survey scaffolding. Astro shells live here; the interactive React state machine (`WaitlistForm`) lives in `islands/` and is embedded by the shells in this folder. Every input MUST have an associated `<label>` (NFR24) and every submission path MUST proxy through a server route in `src/pages/api/` — never call Loops / Turnstile directly from the client.

Do put: Astro form wrappers, honeypot fields, success / error state stubs, label+input composition.
Do not put: client fetch calls to third-party APIs, plain-string error messages that should live in `i18n/{locale}/*.json`.

See PRD FR14 (waitlist) and Architecture §"Form conventions".
