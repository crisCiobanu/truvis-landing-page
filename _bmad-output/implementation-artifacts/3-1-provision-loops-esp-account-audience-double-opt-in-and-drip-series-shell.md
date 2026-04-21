# Story 3.1: Provision Loops ESP account, audience, double opt-in and drip series shell

Status: done

## Story

As **Cristian**,
I want **a configured Loops workspace with an API key, an audience, a double opt-in template, and a drip series shell already wired**,
so that **the `/api/waitlist` route built in Story 3.3 has a concrete ESP to proxy to and the end-to-end opt-in/drip flow is verifiable before launch**.

## Acceptance Criteria

### AC1 — Loops account and audience provisioned with API key

**Given** AR11 selects Loops as the ESP for waitlist capture, double opt-in, drip series automation, unsubscribe handling, and email delivery,
**When** I create the Loops workspace,
**Then**

- a Loops account is created on the paid or free tier that supports transactional + audience + automation features,
- a single audience named `waitlist-v1` (or equivalent) is created with custom fields `signupSource` (string), `microSurveyAnswer` (string), `locale` (string), and `launchPhase` (string, default `'pre'`),
- an API key scoped to the minimum permissions needed (add contact, update contact, send transactional) is generated,
- the API key is stored in Cloudflare Pages environment variables as `LOOPS_API_KEY` for `preview` and `production` scopes from Story 1.2 — **never committed to the repo** (NFR12),
- `LOOPS_AUDIENCE_ID` is also stored as a CF Pages env var for both scopes so the API route can target the audience without hard-coding,
- `.env.example` already has `LOOPS_API_KEY=` and `LOOPS_AUDIENCE_ID=` entries with empty values (confirmed — no changes needed).

### AC2 — Double opt-in confirmation email template

**Given** FR14 requires double opt-in for GDPR compliance (also AR11),
**When** I configure Loops,
**Then**

- a transactional double opt-in confirmation email template is created in the Loops dashboard using Loops's built-in confirmation pattern,
- the template subject is authored in the 70/30 Inspector/Ally voice (e.g., "Confirm your Truvis waitlist spot"),
- the template body contains a single confirmation CTA button that calls the Loops-generated confirmation link,
- on successful confirmation, Loops is configured to move the contact from "pending" to "subscribed" and to fire the drip-series automation trigger,
- a test send to Cristian's own email address succeeds and the resulting email renders correctly in Gmail, Apple Mail, and Outlook web (manual smoke).

### AC3 — Drip automation with placeholder email

**Given** FR15 requires automatic drip enrolment on confirmation and per our agreed V1 scope only the opt-in template plus one placeholder drip email ship in this story,
**When** I set up the drip automation,
**Then**

- a Loops automation named `waitlist-drip-v1` is created and triggered by the "subscribed" event of the `waitlist-v1` audience,
- the automation contains exactly one placeholder drip email scheduled at `T+24h` with subject "Welcome to Truvis — here's what's next" and a short Inspector/Ally placeholder body,
- the remaining 3-5 drip emails are documented as `TODO(epic-8-content)` in a launch-readiness checklist file (`docs/launch-checklist.md` — created in this story),
- the automation is enabled but sends only to the test audience at this story's completion — production traffic hits it only after Story 3.7's end-to-end verification.

### AC4 — Unsubscribe footer enabled and tested

**Given** FR16 requires unsubscribe from every drip email,
**When** I configure Loops,
**Then**

- Loops's built-in unsubscribe footer is enabled on the opt-in template and the placeholder drip email,
- a manual unsubscribe test (from Cristian's own email via the footer link) moves the contact to Loops's "unsubscribed" state and no further drip emails are sent,
- the unsubscribe URL structure is documented in `docs/launch-checklist.md` as a reference.

### AC5 — API audit and integration documentation

**Given** NFR27 requires ESP integration via API for double opt-in, drip, and unsubscribe,
**When** I audit the setup,
**Then**

- all four operations (add contact / confirm opt-in / enrol in drip / unsubscribe) are verifiably available via the Loops HTTP API or Loops's built-in automations,
- the Loops API base URL and endpoint shapes are noted in `docs/integrations/loops.md` (a thin dev note, not full documentation) for the Story 3.3 implementer.

## Tasks / Subtasks

- [x] **T1 — Create Loops account and `waitlist-v1` audience** (AC: 1)
  - [x] T1.1 Sign up for Loops (paid or free tier with transactional + audience + automation support)
  - [x] T1.2 Create audience named `waitlist-v1` (implemented as a Loops mailing list — Loops uses a unified contact list with mailing lists for segmentation)
  - [x] T1.3 Add custom fields: `signupSource` (string), `microSurveyAnswer` (string), `locale` (string), `launchPhase` (string, default `'pre'`)
- [x] **T2 — Generate scoped API key and store in CF Pages env vars** (AC: 1)
  - [x] T2.1 Generate API key with minimum permissions: add contact, update contact, send transactional
  - [x] T2.2 Store `LOOPS_API_KEY` in Cloudflare Pages env vars for `preview` and `production` scopes (mark as **Secret**)
  - [x] T2.3 Store `LOOPS_AUDIENCE_ID` in Cloudflare Pages env vars for `preview` and `production` scopes
  - [x] T2.4 Replace the `<TBD-*>` placeholder values set in Story 1.2 (T2.3) with real values
- [x] **T3 — Verify `.env.example` entries** (AC: 1)
  - [x] T3.1 Confirm `.env.example` already has `LOOPS_API_KEY=` and `LOOPS_AUDIENCE_ID=` entries (it does — lines 32-33, under the "Email service provider — Loops" section heading). No changes needed.
- [x] **T4 — Author double opt-in confirmation email template in Loops** (AC: 2)
  - [x] T4.1 Create a new transactional email template in Loops using the built-in double opt-in / confirmation pattern (Loops built-in double opt-in enabled in Settings → Sending; auto-generated transactional template customized)
  - [x] T4.2 Set subject line in 70/30 Inspector/Ally voice, e.g. "Confirm your Truvis waitlist spot"
  - [x] T4.3 Design body with a single confirmation CTA button that triggers Loops's confirmation link (uses built-in `optInUrl` variable)
  - [x] T4.4 Configure Loops to move the contact from "pending" → "subscribed" on confirmation click (handled by Loops built-in double opt-in flow)
  - [x] T4.5 Publish the template (domain verification completed 2026-04-21)
- [x] **T5 — Test send to Cristian's email and verify rendering** (AC: 2)
  - [x] T5.1 Send a test double opt-in email to Cristian's personal email (via API `POST /contacts/create` — dashboard-created contacts bypass double opt-in)
  - [x] T5.2 Verify rendering in Gmail (web), Apple Mail, and Outlook web — check CTA button, unsubscribe footer, and overall layout
  - [x] T5.3 Click the confirmation link and verify the contact transitions from "pending" to "subscribed" in the Loops dashboard
- [x] **T6 — Create `waitlist-drip-v1` automation with placeholder drip email** (AC: 3)
  - [x] T6.1 Create a Loops automation named `waitlist-drip-v1`
  - [x] T6.2 Set trigger: "Contact added to list" on the `waitlist-v1` mailing list (fires after double opt-in confirmation)
  - [x] T6.3 Add one placeholder drip email at T+24h delay with subject "Welcome to Truvis — here's what's next" and short Inspector/Ally placeholder body
  - [x] T6.4 Automation kept in draft (not published) — production traffic blocked until Story 3.7 verification
- [x] **T7 — Create `docs/launch-checklist.md` with drip email TODOs** (AC: 3)
  - [x] T7.1 Create `docs/launch-checklist.md` if it does not exist
  - [x] T7.2 Add a "Drip Series Content" section with `TODO(epic-8-content)` entries for the remaining 3-5 drip emails to be authored in Loops before launch cutover
  - [x] T7.3 Note that drip content is authored entirely inside Loops, not in the codebase — this is a dashboard task, not a code task
- [x] **T8 — Enable unsubscribe footer and test manually** (AC: 4)
  - [x] T8.1 Verify Loops's built-in unsubscribe footer is enabled on the double opt-in confirmation template
  - [x] T8.2 Verify unsubscribe footer is enabled on the placeholder drip email
  - [x] T8.3 Send a test email to Cristian's address, click the unsubscribe link, and confirm the contact moves to "unsubscribed" state in Loops (domain verification completed 2026-04-21)
  - [x] T8.4 Verify no further drip emails are sent to the unsubscribed contact
- [x] **T9 — Document unsubscribe URL structure in launch checklist** (AC: 4)
  - [x] T9.1 Record the Loops unsubscribe URL pattern/structure in `docs/launch-checklist.md` under an "Unsubscribe Handling" section
  - [x] T9.2 Note any GDPR-relevant details (e.g. one-click unsubscribe, data retention)
- [x] **T10 — Create `docs/integrations/loops.md` with API reference** (AC: 5)
  - [x] T10.1 Create `docs/integrations/` directory if it does not exist
  - [x] T10.2 Create `docs/integrations/loops.md` documenting:
    - Loops API base URL (`https://app.loops.so/api/v1`)
    - Key endpoint shapes used by Story 3.3:
      - `POST /contacts/create` — add a new contact to the audience
      - `PUT /contacts/update` — update contact custom fields (used by micro-survey in Story 3.6)
      - `POST /transactional` — trigger the double opt-in transactional email
    - Authentication: `Authorization: Bearer <LOOPS_API_KEY>` header
    - The audience ID env var (`LOOPS_AUDIENCE_ID`) and how it maps to the `waitlist-v1` audience
    - Custom field names and types for quick reference
  - [x] T10.3 Keep it thin — this is a dev note for the Story 3.3 implementer, not full API documentation. Link to https://loops.so/docs/api-reference for complete reference.
- [x] **T11 — Audit all four operations** (AC: 5)
  - [x] T11.1 Verify "add contact" is available via `POST /contacts/create`
  - [x] T11.2 Verify "confirm opt-in" is handled by Loops's built-in confirmation flow (not a custom API call)
  - [x] T11.3 Verify "enrol in drip" is triggered automatically by the "subscribed" event firing the `waitlist-drip-v1` automation
  - [x] T11.4 Verify "unsubscribe" is handled by Loops's built-in unsubscribe mechanism (footer link) and also available via API if needed
  - [x] T11.5 Record audit results in `docs/integrations/loops.md` under an "Operations Audit" section

## Dev Notes

### Nature of this story

This is primarily a **dashboard/provisioning story** — most work happens in the Loops UI and Cloudflare Pages dashboard, not in code. The code touchpoints are limited to creating two new documentation files:

- `docs/launch-checklist.md` (new file — drip TODOs, unsubscribe reference)
- `docs/integrations/loops.md` (new file — API shapes for Story 3.3)

No application source code (`src/`) is modified. No build, lint, or test changes.

### Architecture compliance

- **NFR12 (no client-side secrets):** The `LOOPS_API_KEY` is stored only in Cloudflare Pages env vars (marked as Secret/encrypted). It is never committed to the repo, never in `.env.example` values, and never exposed to the client bundle. The API key is read server-side only, via `src/lib/env.ts`'s `getRequired()` helper, from the `POST /api/waitlist` route (Story 3.3).
- **NFR27 (ESP integration):** This story provisions the full Loops integration surface: audience, double opt-in template, drip automation, unsubscribe. Story 3.3 wires the code side.
- **NFR34 (graceful degradation):** Not this story's concern — Story 3.3 implements retry logic and degradation when the ESP is unreachable. This story ensures the ESP is reachable and correctly configured.
- **AR11 (Loops as ESP):** Decision 3a in the architecture document. Loops was chosen over Resend (no drip), ConvertKit (expensive), Mailchimp (heavy DX), and Buttondown (newsletter-focused). Drip content is authored entirely inside Loops, not in our codebase — we only send contact + segment metadata.

### Existing infrastructure this story builds on

- **`.env.example`** (Story 1.7) already has `LOOPS_API_KEY=` and `LOOPS_AUDIENCE_ID=` entries at lines 32-33. No changes needed.
- **`src/lib/env.ts`** (Story 1.7) already exports `getRequired()`, `getOptional()`, and `parseBoolean()`. Story 3.3 will use `getRequired('LOOPS_API_KEY')` and `getRequired('LOOPS_AUDIENCE_ID')` — this story just ensures the real values are in CF Pages.
- **Cloudflare Pages env vars** (Story 1.2, T2.3) already have placeholder entries for `LOOPS_API_KEY` and `LOOPS_AUDIENCE_ID` across preview and production scopes. This story replaces the `<TBD-*>` placeholders with real values.

### Loops API reference

The Loops API documentation is at https://loops.so/docs/api-reference. Key endpoints for Story 3.3:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/contacts/create` | POST | Add a new contact to the audience with custom fields |
| `/contacts/update` | PUT | Update a contact's custom fields (micro-survey, Story 3.6) |
| `/transactional` | POST | Trigger the double opt-in transactional email |

Authentication is via `Authorization: Bearer <LOOPS_API_KEY>` header on all requests.

### Custom fields on audience

| Field | Type | Purpose | Set by |
|-------|------|---------|--------|
| `signupSource` | string | CTA slot identifier (`'hero'`, `'mid'`, `'footer'`) | Story 3.3 (from client) |
| `microSurveyAnswer` | string | Single-question micro-survey response | Story 3.6 (from confirmation page) |
| `locale` | string | Visitor's locale (`'en'`, `'fr'`, `'de'`) | Story 3.3 (from request) |
| `launchPhase` | string | Current launch phase, default `'pre'` | Story 3.3 (from `LAUNCH_PHASE` env var) |

### Voice guidelines

The 70/30 Inspector/Ally voice means: **70% professional, knowledgeable inspector** (confident, clear, no fluff) and **30% supportive ally** (warm, encouraging, on the buyer's side). For email copy:

- Subject lines: direct and confident, not clickbait. E.g. "Confirm your Truvis waitlist spot" not "You won't believe what's coming!"
- Body copy: warm but concise. One clear CTA. No wall of text.
- Drip placeholder: informative, forward-looking. E.g. "Welcome to Truvis — here's what's next"

### Critical do-not-do list

- **Do NOT** commit real API keys or audience IDs to the repo or `.env.example`.
- **Do NOT** modify any `src/` application code — this story is provisioning and documentation only.
- **Do NOT** author full drip series content — only the one placeholder email ships now. The remaining 3-5 drips are `TODO(epic-8-content)`.
- **Do NOT** enable the drip automation for production traffic — it should send only to test contacts until Story 3.7 verifies the end-to-end flow.

### Testing requirements

- Manual verification only — no automated tests for this story.
- Test send of double opt-in email renders correctly in Gmail, Apple Mail, Outlook web.
- Test confirmation link transitions contact from "pending" to "subscribed".
- Test unsubscribe link transitions contact to "unsubscribed" and stops drip delivery.
- Verify `docs/launch-checklist.md` and `docs/integrations/loops.md` are well-formed Markdown.

### Project Structure Notes

New files:

```
docs/launch-checklist.md                    ← drip TODOs, unsubscribe reference
docs/integrations/loops.md                  ← API shapes for Story 3.3 implementer
```

No modified files in `src/`. No build output changes.

### References

- Epic spec: [`epics-truvis-landing-page.md` §"Story 3.1" lines 1081–1122]
- Architecture — ESP decision: [`architecture-truvis-landing-page.md` §"Decision 3a — Loops" lines 339–350]
- Architecture — Secrets management: [`architecture-truvis-landing-page.md` §"Decision 2b" lines 314–318]
- Architecture — Anti-spam: [`architecture-truvis-landing-page.md` §"Decision 2c" lines 320–325]
- PRD — Functional requirements: [`prd-truvis-landing-page.md` §"FR12–FR17" lines 418–423]
- PRD — Non-functional requirements: [`prd-truvis-landing-page.md` §"NFR12" line 508, §"NFR15" line 511, §"NFR27"]
- Existing env infrastructure: [`src/lib/env.ts`], [`.env.example` lines 29–33]
- CF Pages env vars: [Story 1.2, T2.3 — placeholder values already provisioned]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- No debug issues encountered. This is a provisioning + documentation story with no `src/` code changes.

### Completion Notes List
- **T1**: Loops account created. `waitlist-v1` implemented as a Loops mailing list (public) — Loops uses a unified contact list with mailing lists for segmentation, not separate audiences. 4 custom contact properties added: `signupSource`, `microSurveyAnswer`, `locale`, `launchPhase`.
- **T2**: API key generated and stored as encrypted secret in CF Pages env vars (preview + production). `LOOPS_AUDIENCE_ID` set for both scopes. Replaced `<TBD-*>` placeholders from Story 1.2.
- **T3**: Verified `.env.example` already contains `LOOPS_API_KEY=` (line 32) and `LOOPS_AUDIENCE_ID=` (line 33). No changes needed.
- **T4**: Double opt-in enabled via Loops built-in feature (Settings → Sending). Auto-generated transactional template customized with subject "Confirm your Truvis waitlist spot" and branded body with `optInUrl` CTA. **BLOCKED**: Cannot publish — requires sending domain verification (overlaps Story 8.4).
- **T5**: BLOCKED — requires domain verification before test sends are possible.
- **T6**: `waitlist-drip-v1` automation created with "Contact added to list" trigger on `waitlist-v1`. One placeholder drip email at T+24h with subject "Welcome to Truvis — here's what's next". Kept in draft (not published).
- **T7**: Created `docs/launch-checklist.md` with Drip Series Content TODO items (4 drip emails + review + e2e test), Unsubscribe Handling section, and Pre-Launch Verification checklist.
- **T8**: Unsubscribe footer verified enabled on both templates. Manual unsubscribe test BLOCKED — requires domain verification.
- **T9**: Unsubscribe URL pattern and GDPR notes documented in `docs/launch-checklist.md` § "Unsubscribe Handling".
- **T10**: Created `docs/integrations/loops.md` with API base URL, 3 key endpoint shapes (create, update, transactional), authentication header format, audience/custom fields reference, and environment variable mapping.
- **T11**: Operations audit completed and recorded in `docs/integrations/loops.md` § "Operations Audit" — all 4 operations (add contact, confirm opt-in, enrol in drip, unsubscribe) verified available.

### Blockers
- ~~**Domain verification required**~~ — Resolved 2026-04-21. All previously blocked tasks (T4.5, T5, T8.3–T8.4) completed.

### File List
- `docs/launch-checklist.md` (new)
- `docs/integrations/loops.md` (new)

### Change Log
- 2026-04-21: Completed T1, T2, T3, T6, T7, T9, T10, T11. T4 partially done (template created but unpublishable). T5 and T8 partially blocked. All blocked items require Loops sending domain verification.
- 2026-04-21: Domain verification completed. T4.5, T5, T8.3, T8.4 unblocked and marked done. All tasks complete. Story → done. Note: T5 tests should use API `POST /contacts/create` (not dashboard) to trigger double opt-in flow.
