/**
 * Astro middleware entry point — Story 1.6.
 *
 * Astro convention: the framework looks for `src/middleware.ts` (or
 * `src/middleware/index.ts`) and runs the exported `onRequest` handler
 * on every request. Project policy keeps business logic in `src/lib/`
 * (see CLAUDE.md § Architectural boundaries), so this file is a thin
 * re-export of the locale-detection handler.
 */
export { onRequest } from '@/lib/middleware/locale-detection';
