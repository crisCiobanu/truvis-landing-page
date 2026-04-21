# Loops Integration -- Developer Reference

Thin reference for the Story 3.3 `/api/waitlist` implementer. For the full API docs see <https://loops.so/docs/api-reference>.

---

## Authentication

All requests require the header:

```
Authorization: Bearer <LOOPS_API_KEY>
```

`LOOPS_API_KEY` is read server-side via `src/lib/env.ts` -- `getRequired('LOOPS_API_KEY')`. Never expose client-side.

---

## API Base URL

```
https://app.loops.so/api/v1
```

---

## Key Endpoints

### Add contact

```
POST /contacts/create
```

Creates a new contact in the `waitlist-v1` audience. Include custom fields in the request body.

```json
{
  "email": "user@example.com",
  "mailingLists": { "<LOOPS_AUDIENCE_ID>": true },
  "signupSource": "hero",
  "locale": "en",
  "launchPhase": "pre"
}
```

### Update contact

```
PUT /contacts/update
```

Updates custom fields on an existing contact. Used by the micro-survey (Story 3.6).

```json
{
  "email": "user@example.com",
  "microSurveyAnswer": "buyer"
}
```

### Send transactional email

```
POST /transactional
```

Triggers the double opt-in confirmation email.

```json
{
  "transactionalId": "<TEMPLATE_ID>",
  "email": "user@example.com"
}
```

The `transactionalId` is the ID of the double opt-in template created in the Loops dashboard (Story 3.1, T4).

---

## Audience and Custom Fields

**Audience:** `waitlist-v1` (ID stored in `LOOPS_AUDIENCE_ID` env var)

| Field               | Type   | Purpose                                             | Set by    |
| ------------------- | ------ | --------------------------------------------------- | --------- |
| `signupSource`      | string | CTA slot identifier (`'hero'`, `'mid'`, `'footer'`) | Story 3.3 |
| `microSurveyAnswer` | string | Single-question micro-survey response               | Story 3.6 |
| `locale`            | string | Visitor's locale (`'en'`, `'fr'`, `'de'`)           | Story 3.3 |
| `launchPhase`       | string | Current launch phase, default `'pre'`               | Story 3.3 |

---

## Operations Audit

All four required operations (NFR27) are verified available:

| Operation      | Method                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Add contact    | `POST /contacts/create` -- direct API call from `/api/waitlist`        |
| Confirm opt-in | Built-in Loops confirmation flow (link in transactional email)         |
| Enrol in drip  | Automatic -- "subscribed" event triggers `waitlist-drip-v1` automation |
| Unsubscribe    | Built-in Loops unsubscribe footer link + `DELETE /contacts/{id}` API   |

---

## Environment Variables

| Variable            | Scope       | Location              | Notes                 |
| ------------------- | ----------- | --------------------- | --------------------- |
| `LOOPS_API_KEY`     | Server-only | CF Pages env (Secret) | Never client-exposed  |
| `LOOPS_AUDIENCE_ID` | Server-only | CF Pages env          | Maps to `waitlist-v1` |
