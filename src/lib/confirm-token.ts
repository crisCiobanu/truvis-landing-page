/**
 * Double opt-in confirmation token — HMAC-SHA256 via Web Crypto API.
 *
 * Generates and validates stateless confirmation tokens so the
 * `/api/confirm` endpoint can verify that the link was issued by us
 * without needing a database or KV store.
 *
 * Token = hex(HMAC-SHA256(secret, email)).
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

/**
 * Generate a confirmation token for the given email.
 */
export async function generateConfirmToken(
  email: string,
  secret: string
): Promise<string> {
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(email.toLowerCase().trim())
  );
  return bufferToHex(signature);
}

/**
 * Validate a confirmation token against the expected email.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function validateConfirmToken(
  email: string,
  token: string,
  secret: string
): Promise<boolean> {
  const expected = await generateConfirmToken(email, secret);
  if (expected.length !== token.length) return false;
  // Constant-time comparison
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return mismatch === 0;
}
