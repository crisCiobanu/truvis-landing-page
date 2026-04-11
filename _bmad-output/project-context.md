---
project_name: 'car-buy-assistant'
user_name: 'Cristian'
date: '2026-03-17'
sections_completed: ['technology_stack', 'language_specific', 'framework_specific', 'testing', 'code_quality', 'workflow', 'critical_rules']
status: 'complete'
rule_count: 52
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Expo SDK | 54 |
| Runtime | React Native | 0.81.5 |
| Runtime | React | 19.1 (breaking changes vs 18 — no forwardRef wrapper, `use()` hook) |
| Runtime | TypeScript | 5.9 (strict mode) |
| Runtime | Engine | Hermes, New Architecture enabled |
| Styling | NativeWind | 4.2 (Tailwind CSS for RN) |
| Styling | Tailwind CSS | 3.4 |
| State | Zustand | 5.x |
| Storage | react-native-mmkv | 4.x |
| Data | @powersync/react-native | 1.31 (offline-first sync, uses SQLite internally) |
| Data | @supabase/supabase-js | 2.98 |
| Navigation | expo-router | 6.x (file-based routing) |
| UI | @rn-primitives/* | 1.2 |
| UI | lucide-react-native | icons |
| Animation | react-native-reanimated | 4.1 |
| Camera | react-native-vision-camera | 4.7 |
| Testing | Jest + jest-expo | 29.7 / 55 |
| Testing | @testing-library/react-native | 13.3 |
| Monitoring | @sentry/react-native | 8.3 |

## Critical Implementation Rules

### Language-Specific Rules

- **TypeScript strict mode** — all code must compile under `strict: true`
- **Path aliases:** use `@/` or `~/` to import from project root (both resolve identically)
- **File naming:** kebab-case for all files (`use-auth-store.ts`, `severity-badge.tsx`)
- **Component exports:** PascalCase (`SeverityBadge`, `ChecklistView`)
- **Test file naming:** always `__tests__/<subject>.test.ts(x)` — never `.spec.ts`
- **Feature isolation (ESLint-enforced):** features must NEVER import from other features — only from `lib/`, `components/ui/`, `components/layout/`, or own submodules
- **Shared types:** if a type is needed by more than one feature, it must live in `lib/` — never import types cross-feature
- **Shared code placement:** cross-feature utilities go in `lib/`, shared UI in `components/ui/`, layout wrappers in `components/layout/`
- **No barrel exports:** do not create `index.ts` re-export files — import each module by its direct path
- **PowerSync queries:** each feature keeps SQL queries in a root-level `queries.ts` file — not inside hooks or stores
- **DB schema:** `lib/powersync-schema.ts` is the single source of truth for table definitions
- **Test factories:** use shared factories in `__tests__/factories.ts` — do not create inline test data

### Framework-Specific Rules

- **NativeWind v4 babel config:** use `['babel-preset-expo', { jsxImportSource: 'nativewind' }]` — do NOT add `nativewind/babel` as a separate preset (v4 changed this)
- **NativeWind v4 metro config:** must wrap with `withNativeWind(config, { input: './global.css' })` in `metro.config.js`
- **Reanimated plugin:** `react-native-reanimated/plugin` MUST be the last entry in `babel.config.js` plugins — build will break otherwise
- **Screens are thin:** `app/` route files only compose feature components and pass route params — no `useState`, `useEffect`, or business logic. Only expo-router hooks (`useLocalSearchParams`, `useRouter`) are allowed in `app/` files
- **Routing conventions:** new screens go in the correct `app/` group (`(auth)/`, `(tabs)/`) with appropriate `_layout.tsx` — never bypass file-based routing
- **UI primitives:** use `components/ui/*` wrappers (built on `@rn-primitives`) — never use raw RN components (`TextInput`, `Switch`, etc.) directly in feature code
- **Offline-first data:** read data from PowerSync reactive queries, NOT direct Supabase calls. Supabase is the sync target only — direct Supabase usage is limited to auth flows and edge function calls
- **Zustand stores:** one store per feature in `features/<name>/stores/<name>-store.ts`
- **Hooks location:** custom hooks in `features/<name>/hooks/use-<name>.ts`
- **Styling:** use NativeWind `className` prop — 4pt spacing grid, severity color tokens (`severity-green-bg`, `severity-red-text`, etc.)
- **Poker Face dual palette:** severity tokens for buyer view, `poker-face-*` tokens for seller-facing neutral view — never mix palettes within a single view mode
- **Touch targets:** use `.touch-target` utility class for interactive elements (enforces 48x48pt minimum)
- **Component variants:** use CVA (`class-variance-authority`) + `clsx` + `tailwind-merge` for variant-based styling
- **Test styling:** NativeWind classes don't resolve in tests — assert component structure and interactions via `@testing-library/react-native`, not computed styles

### Internationalization Rules

- **i18n library:** `i18next` + `react-i18next` + `expo-localization` — configured in `lib/i18n.ts`
- **Polyfill:** `intl-pluralrules` loaded before i18next init (Hermes has no native Intl.PluralRules)
- **Translation files:** `locales/{locale}/{namespace}.json` — namespaces match feature domains (`common`, `auth`, `vehicles`, `inspection`, `severity`, `reports`, `settings`)
- **String access:** always use `useTranslation('{namespace}')` hook — never hardcode user-facing strings
- **Key convention:** dot-notation `{feature}.{section}.{element}` (e.g., `inspection.summary.title`)
- **Locale persistence:** user language preference stored in MMKV, read synchronously at app init
- **Text expansion:** all layouts must tolerate 40% text expansion (NFR35) — test with German locale
- **Adding a new string:** add the key to `en/{namespace}.json`, then add translations to `fr/{namespace}.json` and `de/{namespace}.json` before committing

### Testing Rules

- **Run commands:** always wrap with `bash scripts/run_silent.sh "jest" npx jest --no-coverage --bail` — direct `jest`/`npx jest` calls are blocked by a hook. Never add coverage flags
- **Test location:** tests go in `__tests__/` within the relevant feature or at project root
- **Test naming:** `<subject>.test.ts(x)` — match the source file name (e.g., `use-auth-store.ts` → `use-auth-store.test.ts`)
- **Factories:** use `__tests__/factories.ts` for test data — do not duplicate or inline factory data
- **Mock placement:** project-level mocks go in root `__mocks__/` directory — always check for existing mocks before creating new ones. Prefer shared mocks over inline `jest.mock()` calls
- **Zustand state isolation:** stores persist between tests — always reset store state in `beforeEach` to prevent cross-test contamination
- **Test ordering:** `--bail` fails on first error — put fundamental/happy-path tests first in the file, edge cases after
- **Query tests:** every `queries.ts` file needs a dedicated `__tests__/queries.test.ts` — do not rely on hook tests to cover SQL query logic
- **AC mapping:** test descriptions should clearly map to story acceptance criteria for reviewability
- **transformIgnorePatterns:** when adding new `@rn-primitives/*`, `@powersync/*`, or RN-ecosystem packages, update the regex in `jest.config.js` or tests will fail with syntax errors
- **Component tests:** use `@testing-library/react-native` — test user-visible behavior (render, press, text content), not implementation details
- **No style assertions:** NativeWind classes are not resolved in test env — do not assert on styles

### Code Quality & Style Rules

- **Lint command:** always wrap with `bash scripts/run_silent.sh "eslint" npx expo lint` — direct `eslint` calls are blocked by a hook
- **ESLint config:** flat config format (`eslint.config.js`) using `eslint-config-expo/flat` — do NOT add `eslint-plugin-import` separately, it's already included
- **Feature structure:** each feature follows `components/`, `hooks/`, `stores/`, `utils/`, `__tests__/`, `types.ts`, `queries.ts` — only create subdirectories that are needed
- **No dead code:** remove unused imports, variables, and functions — do not comment them out or rename with `_` prefix

### Development Workflow Rules

- **Branch naming:** `story/<story-id>-<short-description>` (e.g., `story/6-1-basic-inspection-summary-free-tier`)
- **Commit format:** `feat(story-X.Y): description` for feature work — use conventional commit prefixes (`feat`, `fix`, `refactor`, `test`, `docs`)
- **Story specs:** read the story spec in `_bmad-output/implementation-artifacts/` before implementing — it contains ACs, technical notes, and constraints
- **Sprint status:** check `_bmad-output/implementation-artifacts/sprint-status.yaml` for current progress and dependencies

### Critical Don't-Miss Rules

**Build & Config Traps:**
- **Never add `nativewind/babel` preset** — NativeWind v4 uses `jsxImportSource` on `babel-preset-expo` instead
- **Reanimated plugin position** — MUST be the last babel plugin or build breaks with misleading errors
- **`global.css` import** — must be imported at the top of `app/_layout.tsx` (before component imports) or NativeWind styles silently stop working across the entire app

**Architectural Invariants:**
- **Never import across features** — the #1 architectural violation. Extract shared code to `lib/`, `components/ui/`, or `components/layout/`
- **Never read from Supabase directly** — use PowerSync for all data reads. Supabase is the sync backend only (auth + edge functions excepted)
- **Never use raw RN components in features** — always use `components/ui/*` wrappers
- **Dual-schema sync** — `lib/powersync-schema.ts` (local SQLite) and `supabase/migrations/` (remote) MUST stay in sync. Modifying one without the other causes silent data loss

**API & Syntax Gotchas:**
- **Zustand v5 curried create** — use `create<StateType>()(...)` (double invocation), NOT `create<StateType>(...)`. Check existing stores for the pattern
- **React 19 refs** — `ref` is a regular prop, do NOT use `forwardRef`. When extending `@rn-primitives`, follow that primitive's existing pattern
- **MMKV is synchronous** — do not wrap MMKV calls in `async/await`
- **Hermes limitations** — no `Intl` polyfill by default, limited `Proxy` support. Check Hermes compatibility for advanced JS features
- **PowerSync SQL dialect** — uses SQLite syntax, not PostgreSQL. Queries in `queries.ts` must be SQLite-compatible
- **expo-router dynamic routes** — `[id].tsx` and `[id]/` directory coexist with specific layout implications. Understand the routing hierarchy before adding nested dynamic routes

**Testing Traps:**
- **Never run test/lint without `run_silent.sh`** — direct invocations are blocked by a hook
- **Manual mocks required** — `expo-image`, `react-native-vision-camera`, `react-native-mmkv` are NOT auto-mocked by `jest-expo`. Tests will crash on native module errors without manual mocks
- **Async state assertions** — use `await waitFor(() => ...)` for assertions after Zustand state changes triggered by user interactions, not synchronous assertions after `fireEvent`

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-03-17
