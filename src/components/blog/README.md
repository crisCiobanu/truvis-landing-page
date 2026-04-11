# `blog/` — Tier 2 blog composites

Blog-specific Tier 2 components: `BlogPreviewCard`, `RelatedArticles`, `CategoryPills`, `ShareButtons`, inline article CTA block. These compose `ui/` primitives and consume data exclusively through `src/lib/content.ts` — never call `getCollection()` directly (AR-content-access). Any interactive widget (category filter, search) must live in `islands/` and be imported from this folder.

Do put: article card, related-articles list, category filter shell, share-button stub.
Do not put: raw content-collection calls, Markdown rendering for non-blog content, analytics wiring.

See PRD §Blog & Content API, CONTRACT.md (blog API contract), CLAUDE.md → "Content access".
