# Story 3.7: Verify end-to-end double opt-in, drip enrolment and unsubscribe via Loops test audience

Status: ready-for-dev

## Story

As **the Truvis development team**,
I want **to verify the entire waitlist conversion loop (submission, double opt-in, drip enrolment, micro-survey, unsubscribe) against a real Loops test audience on the preview environment**,
so that **we have documented confidence that all Epic 3 functionality works end-to-end before launch, with every happy path and failure mode confirmed and recorded in the launch checklist**.

## Acceptance Criteria

### AC1 — Test environment established and documented

**Given** Stories 3.1--3.6 are complete and deployed to the Cloudflare Pages preview environment,
**When** verification begins,
**Then**

- a dedicated Loops test audience approach is identified (sandbox mode or `+test@` email aliases),
- the test environment setup is documented in `docs/launch-checklist.md` under a "Waitlist verification" heading,
- all testing is performed on the Cloudflare Pages preview deployment -- NOT production,
- the preview URL, date, and tester identity are recorded.

### AC2 — Happy path verified for all three signup positions

**Given** the preview environment is running with valid Turnstile and Loops credentials,
**When** the happy path test script is executed for each of the three CTA positions,
**Then** each step below is confirmed in writing in `docs/launch-checklist.md`:

1. Open preview URL in a private browser window, submit the hero waitlist form with a `+test-hero@` alias email, confirm `POST /api/waitlist` returns 200 with no exposed secrets in the response or network payload,
2. Confirm the browser navigates to `/waitlist-confirmed?email=...`,
3. Confirm the double opt-in email arrives in the test inbox within ~2 minutes,
4. Click the confirmation link in the email, confirm Loops moves the contact from `pending` to `subscribed`,
5. Confirm the drip automation fires and the placeholder drip email arrives (temporarily shorten delay from T+24h to T+2min for testing; revert after),
6. Click the unsubscribe footer link in the drip email, confirm Loops moves the contact to `unsubscribed`,
7. Repeat steps 1--6 with `+test-mid@` from the mid-page CTA and `+test-footer@` from the footer CTA,
8. Verify `signupSource` is correctly recorded in Loops for all three positions (`hero`, `mid`, `footer`).

### AC3 — Failure modes verified

**Given** the preview environment is running,
**When** each failure scenario is tested,
**Then** the outcome is recorded in `docs/launch-checklist.md`:

- **Malformed email** (e.g., "notanemail"): client-side `invalid_email` error is shown WITHOUT hitting Loops (verify no network request to `/api/waitlist`),
- **Already-subscribed alias**: a friendly `duplicate` message is displayed, not a hard error or stack trace,
- **Forced ESP failure** (rotate `LOOPS_API_KEY` to an invalid value in CF Pages preview env, or block `loops.so` via DevTools): the `esp_unavailable` toast is surfaced and the user's email input text is preserved (NFR34, UX-DR16),
- **Honeypot filled** (DevTools: set the hidden `name="website"` input value to "bot-test"): the endpoint returns `200 ok: true` but NO contact is created in Loops (silent-success spam rejection per NFR15).

### AC4 — Micro-survey persistence verified

**Given** a contact has been created via the waitlist form and the browser has navigated to `/waitlist-confirmed`,
**When** the user clicks a micro-survey option on the confirmation page,
**Then** the Loops contact's `microSurveyAnswer` custom field updates within ~5 seconds, visible in the Loops dashboard contact detail view.

### AC5 — Verification completed and documented

**Given** all happy path and failure mode tests have been executed,
**When** the verification is complete,
**Then**

- `docs/launch-checklist.md` contains a dated "Epic 3 verification" section with pass/fail outcomes for every test case,
- any bugs discovered are filed as follow-up stories against Epic 3,
- this story is NOT marked done until ALL happy path and failure path tests pass,
- all `+test@` contacts are deleted from the Loops audience after verification,
- the drip automation timing is reverted from T+2min back to T+24h.

## Tasks / Subtasks

- [ ] **Task 1 — Set up test environment** (AC: 1)
  - [ ] T1.1 Identify and document the Loops test audience approach (sandbox mode or `+test@` email aliases using Cristian's email)
  - [ ] T1.2 Confirm the CF Pages preview deployment has valid `LOOPS_API_KEY`, `TURNSTILE_SECRET_KEY`, and `PUBLIC_TURNSTILE_SITE_KEY` environment variables
  - [ ] T1.3 Record the preview URL, date, and tester in the checklist

- [ ] **Task 2 — Document test environment in launch checklist** (AC: 1)
  - [ ] T2.1 Create or update `docs/launch-checklist.md` with a "Waitlist verification" section describing the test environment, approach, and prerequisites

- [ ] **Task 3 — Execute happy path: hero position (+test-hero@)** (AC: 2)
  - [ ] T3.1 Open preview URL in a private/incognito browser window
  - [ ] T3.2 Submit the hero waitlist form with a `+test-hero@` email alias
  - [ ] T3.3 Verify `POST /api/waitlist` returns 200 in the Network tab
  - [ ] T3.4 Verify no secrets (`TURNSTILE_SECRET_KEY`, `LOOPS_API_KEY`) appear in the response, request payload, page source, or JS bundles (DevTools Sources tab search)
  - [ ] T3.5 Verify browser navigates to `/waitlist-confirmed?email=...`
  - [ ] T3.6 Verify double opt-in email arrives in the test inbox within ~2 minutes
  - [ ] T3.7 Click the confirmation link in the email, verify Loops dashboard shows contact status changed from `pending` to `subscribed`
  - [ ] T3.8 Temporarily shorten the drip automation delay from T+24h to T+2min in Loops dashboard
  - [ ] T3.9 Verify the drip email arrives after the shortened delay
  - [ ] T3.10 Click the unsubscribe footer link in the drip email, verify Loops dashboard shows contact status changed to `unsubscribed`

- [ ] **Task 4 — Execute happy path: mid position (+test-mid@)** (AC: 2)
  - [ ] T4.1 Repeat Task 3 steps using `+test-mid@` alias via the mid-page CTA form
  - [ ] T4.2 Record all outcomes in the launch checklist

- [ ] **Task 5 — Execute happy path: footer position (+test-footer@)** (AC: 2)
  - [ ] T5.1 Repeat Task 3 steps using `+test-footer@` alias via the footer CTA form
  - [ ] T5.2 Record all outcomes in the launch checklist

- [ ] **Task 6 — Verify signupSource for all three positions** (AC: 2)
  - [ ] T6.1 In the Loops dashboard, inspect the contact record for each test alias
  - [ ] T6.2 Confirm `signupSource` field reads `hero` for the hero contact, `mid` for the mid contact, and `footer` for the footer contact
  - [ ] T6.3 Record results in the launch checklist

- [ ] **Task 7 — Test malformed email** (AC: 3)
  - [ ] T7.1 Enter "notanemail" in the hero form and attempt to submit
  - [ ] T7.2 Verify the `invalid_email` client-side error message appears
  - [ ] T7.3 Verify NO network request to `/api/waitlist` was made (DevTools Network tab)
  - [ ] T7.4 Record outcome in the launch checklist

- [ ] **Task 8 — Test duplicate submission** (AC: 3)
  - [ ] T8.1 Submit the hero form with the same `+test-hero@` email that was already subscribed
  - [ ] T8.2 Verify a friendly `duplicate` message is displayed (not a hard error or stack trace)
  - [ ] T8.3 Record outcome in the launch checklist

- [ ] **Task 9 — Test ESP failure** (AC: 3)
  - [ ] T9.1 Temporarily rotate `LOOPS_API_KEY` in the CF Pages preview env to an invalid value, OR use Chrome DevTools Network tab to block request patterns matching `loops.so`
  - [ ] T9.2 Submit the hero form with a valid email
  - [ ] T9.3 Verify the `esp_unavailable` toast/error message is surfaced to the user
  - [ ] T9.4 Verify the email input text is preserved (user does not lose their typed input) per NFR34 and UX-DR16
  - [ ] T9.5 Restore the valid `LOOPS_API_KEY` after testing
  - [ ] T9.6 Record outcome in the launch checklist

- [ ] **Task 10 — Test honeypot** (AC: 3)
  - [ ] T10.1 Open DevTools Elements panel, locate the hidden `name="website"` input field
  - [ ] T10.2 Set its value to "bot-test"
  - [ ] T10.3 Submit the form with a valid email (e.g., `+test-honeypot@`)
  - [ ] T10.4 Verify the endpoint returns `200 ok: true` (silent success from the user's perspective)
  - [ ] T10.5 Verify NO contact is created in the Loops dashboard for this email
  - [ ] T10.6 Record outcome in the launch checklist

- [ ] **Task 11 — Test micro-survey persistence** (AC: 4)
  - [ ] T11.1 After a successful waitlist submission, on the `/waitlist-confirmed` page click a micro-survey option
  - [ ] T11.2 Within ~5 seconds, check the Loops dashboard contact detail view
  - [ ] T11.3 Verify the `microSurveyAnswer` custom field is populated with the selected value
  - [ ] T11.4 Record outcome in the launch checklist

- [ ] **Task 12 — Document all results** (AC: 5)
  - [ ] T12.1 Compile all pass/fail outcomes into a dated "Epic 3 verification" section in `docs/launch-checklist.md`
  - [ ] T12.2 Include timestamps, screenshots (optional), and pass/fail for every test case

- [ ] **Task 13 — File bugs as follow-up stories** (AC: 5)
  - [ ] T13.1 For any test that fails, create a follow-up story file in `_bmad-output/implementation-artifacts/` with a clear description and repro steps
  - [ ] T13.2 Update `_bmad-output/implementation-artifacts/sprint-status.yaml` to reflect the new bug stories

- [ ] **Task 14 — Clear test contacts from Loops** (AC: 5)
  - [ ] T14.1 In the Loops dashboard, delete all `+test-hero@`, `+test-mid@`, `+test-footer@`, and `+test-honeypot@` contacts
  - [ ] T14.2 Verify the test audience is clean

- [ ] **Task 15 — Revert drip automation timing** (AC: 5)
  - [ ] T15.1 In the Loops dashboard, change the drip automation delay from T+2min back to T+24h
  - [ ] T15.2 Confirm the production timing is restored

## Dev Notes

### This is a VERIFICATION-ONLY story -- NO new code

All work in this story is manual testing and documentation. No source code changes are expected. The only file modified in the repository is `docs/launch-checklist.md` (adding the dated verification results).

### Testing environment

Use the Cloudflare Pages preview deployment. Every PR to `main` generates a unique preview URL. Do NOT test against production until Epic 8 launch checklist.

### Email alias approach

Use `+test-hero@`, `+test-mid@`, `+test-footer@` variations of Cristian's email address. Gmail and most providers deliver `user+tag@domain.com` to the base inbox, so all test emails arrive in a single inbox while being distinguishable by their `signupSource` in Loops.

### Drip timing workaround

The production drip delay is T+24h, which is impractical for manual testing. Temporarily change it to T+2min in the Loops dashboard automation settings before testing. This MUST be reverted to T+24h after testing is complete (Task 15).

### DevTools techniques for failure testing

| Failure scenario | DevTools approach |
|---|---|
| ESP failure | Temporarily change `LOOPS_API_KEY` in CF Pages preview env to an invalid value, OR Chrome DevTools > Network > Block request URL pattern matching `loops.so` |
| Honeypot | DevTools > Elements > find `name="website"` hidden input > set value to `"bot-test"` |
| Secret verification | DevTools > Sources tab > search for actual Turnstile secret key and Loops API key values -- they must NOT appear anywhere in page source or JS bundles |

### Secret verification checklist

In Chrome DevTools Sources tab, search for the actual string values of:
- `TURNSTILE_SECRET_KEY` -- must NOT be found
- `LOOPS_API_KEY` -- must NOT be found
- `PUBLIC_TURNSTILE_SITE_KEY` -- EXPECTED to be present (this is a public client key)

### Bug handling

If any test fails, the bug must be filed as a follow-up story against Epic 3. Document the failure in the launch checklist with the expected vs. actual behavior. This story is NOT done until ALL paths pass (either directly or after bug-fix stories are completed).

### Architecture compliance

| Requirement | What to verify |
|---|---|
| NFR12 | No secrets exposed in client-delivered assets |
| NFR15 | Honeypot submissions silently rejected, no Loops contact created |
| NFR34 | ESP failure surfaces `esp_unavailable` toast gracefully |
| UX-DR16 | User's email input text preserved on error (not cleared) |
| FR14 | End-to-end double opt-in flow works (pending -> subscribed) |
| FR15 | Drip enrolment fires after opt-in confirmation |
| FR16 | Unsubscribe link works (subscribed -> unsubscribed) |
| FR17 | Micro-survey answer persists to Loops contact custom field |

### Dependencies

- **Story 3.1** (MUST be complete) -- Loops ESP account, audience, double opt-in, and drip series provisioned
- **Story 3.2** (MUST be complete) -- Cloudflare Turnstile provisioned and keys wired
- **Story 3.3** (MUST be complete) -- `POST /api/waitlist` server route with honeypot, Turnstile, validation, Loops proxy
- **Story 3.4** (MUST be complete) -- `EmailCaptureBlock` composite and `WaitlistForm` island with full state machine
- **Story 3.5** (MUST be complete) -- CTA placeholders replaced with real `EmailCaptureBlock` instances
- **Story 3.6** (MUST be complete) -- `/waitlist-confirmed` page with micro-survey

ALL Stories 3.1--3.6 must be deployed to the preview environment before verification begins.

### Project Structure Notes

Modified files:

```
docs/launch-checklist.md    -- Add dated "Epic 3 verification" section with all test results
```

No new source code files are created or modified by this story. Follow-up bug story files may be created in `_bmad-output/implementation-artifacts/` if any tests fail.

### References

- [Source: epics-truvis-landing-page.md#Story 3.7 -- Verify end-to-end double opt-in, drip enrolment and unsubscribe via Loops test audience]
- [Source: docs/launch-checklist.md -- verification results destination]
- [Source: prd-truvis-landing-page.md#NFR12 -- No client-side secrets]
- [Source: prd-truvis-landing-page.md#NFR15 -- Honeypot silent rejection]
- [Source: prd-truvis-landing-page.md#NFR34 -- ESP graceful degradation]
- [Source: ux-design-specification-truvis-landing-page.md#UX-DR16 -- Input preservation on error]
- [Source: prd-truvis-landing-page.md#FR14 -- Double opt-in]
- [Source: prd-truvis-landing-page.md#FR15 -- Drip enrolment]
- [Source: prd-truvis-landing-page.md#FR16 -- Unsubscribe]
- [Source: prd-truvis-landing-page.md#FR17 -- Micro-survey persistence]
- [Source: Story 3.1 -- Loops provisioning]
- [Source: Story 3.2 -- Turnstile provisioning]
- [Source: Story 3.3 -- Waitlist API route]
- [Source: Story 3.4 -- EmailCaptureBlock and WaitlistForm]
- [Source: Story 3.5 -- CTA slot replacement]
- [Source: Story 3.6 -- Waitlist confirmed page with micro-survey]

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
