# Cloudflare Turnstile Integration -- Developer Reference

Anti-spam layer 2 (AR13). Invisible managed mode -- zero user-facing friction (NFR15).

---

## Local Development -- Test Keys

Cloudflare publishes test keys for local development. Add these to your local `.env` file (copy from `.env.example`):

```env
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

These "always passes" keys make the widget return a valid token and `siteverify` return `success: true`.

> **WARNING:** Test keys must NEVER be used in preview or production environments. Real keys are provisioned in Cloudflare Pages environment variables.

### Additional test key variants

For edge-case testing in Stories 3.3/3.4:

| Variant            | Site Key                   | Secret Key                            |
| ------------------ | -------------------------- | ------------------------------------- |
| Always passes      | `1x00000000000000000000AA` | `1x0000000000000000000000000000000AA` |
| Always fails       | `2x00000000000000000000AB` | `2x0000000000000000000000000000000AB` |
| Forces interactive | `3x00000000000000000000FF` | `3x0000000000000000000000000000000FF` |

See <https://developers.cloudflare.com/turnstile/troubleshooting/testing/> for the full list.

---

## Environment Variables

| Variable                    | Scope                               | Access via                       |
| --------------------------- | ----------------------------------- | -------------------------------- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Client-readable (`PUBLIC_` prefix)  | `getTurnstileConfig().siteKey`   |
| `TURNSTILE_SECRET_KEY`      | Server-only (encrypted in CF Pages) | `getTurnstileConfig().secretKey` |

Both are accessed through `src/lib/env.ts` -- `getTurnstileConfig()`. Never use `import.meta.env` directly.

---

## Integration Architecture

### Turnstile Script

```
https://challenges.cloudflare.com/turnstile/v0/api.js
```

**Loading strategy (NFR5):** The script is loaded **lazily** -- only when the `WaitlistForm` React island becomes visible (via `client:visible` hydration). It is NOT added as a global `<script>` in `<head>` or `BaseLayout`. This keeps the ~30 KB script out of the initial page load, protecting the 500 KB budget.

### Client-side render pattern (Story 3.4)

The form island dynamically injects the script tag, then renders the invisible widget:

```typescript
turnstile.render('#turnstile-container', {
  sitekey: siteKey, // from getTurnstileConfig().siteKey, passed as prop
  callback: (token: string) => {
    /* attach token to form submission */
  },
});
```

The widget is invisible -- no visible element appears to the user.

### Server-side verification (Story 3.3)

The `/api/waitlist` route verifies the token:

```
POST https://challenges.cloudflare.com/turnstile/v0/siteverify
Content-Type: application/json

{
  "secret": "<TURNSTILE_SECRET_KEY>",
  "response": "<token-from-client>"
}
```

Returns `{ "success": true/false, ... }`.

---

## Ownership

| Concern                             | Owner                                 |
| ----------------------------------- | ------------------------------------- |
| Key provisioning + typed accessor   | **Story 3.2** (this story)            |
| Server-side token verification      | **Story 3.3** (`POST /api/waitlist`)  |
| Client widget + lazy script loading | **Story 3.4** (`WaitlistForm` island) |
| Honeypot field (layer 1)            | **Story 3.4**                         |

---

## References

- Cloudflare Turnstile docs: <https://developers.cloudflare.com/turnstile/>
- Test keys: <https://developers.cloudflare.com/turnstile/troubleshooting/testing/>
- API reference: <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>
