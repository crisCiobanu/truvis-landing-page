/**
 * Double opt-in confirmation token — HMAC-SHA256 via Web Crypto API.
 *
 * Generates and validates stateless confirmation tokens so the
 * `/api/confirm` endpoint can verify that the link was issued by us
 * without needing a database or KV store.
 *
 * The HMAC payload includes all fields that travel in the confirmation
 * URL so that none of them can be tampered with.
 */

const encoder = new TextEncoder();

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface ConfirmTokenPayload {
  email: string;
  signupSource: string;
  locale: string;
  launchPhase: string;
}

/** Deterministic string from payload fields for HMAC signing. */
function canonicalize(payload: ConfirmTokenPayload): string {
  return [
    payload.email.toLowerCase().trim(),
    payload.signupSource,
    payload.locale,
    payload.launchPhase,
  ].join('|');
}

/**
 * Generate a confirmation token covering all payload fields.
 */
export async function generateConfirmToken(
  payload: ConfirmTokenPayload,
  secret: string
): Promise<string> {
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(canonicalize(payload))
  );
  return bufferToHex(signature);
}

/**
 * Validate a confirmation token against the expected payload.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function validateConfirmToken(
  payload: ConfirmTokenPayload,
  token: string,
  secret: string
): Promise<boolean> {
  const expected = await generateConfirmToken(payload, secret);
  if (expected.length !== token.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return mismatch === 0;
}
