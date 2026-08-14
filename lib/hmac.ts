// ---------------------------------------------------------------------------
// Shared HMAC-SHA256 signed-payload utilities (WebCrypto).
//
// Token format: <base64url(JSON payload)>.<base64url(HMAC-SHA256 signature)>.
// WebCrypto is used so this runs on Cloudflare Workers and the Node dev
// server alike. Both the unsubscribe links (lib/unsubscribeToken.ts) and
// the login session cookies (lib/session.ts) build on this module.
// ---------------------------------------------------------------------------

/**
 * Reads a secret from process.env, falling back to a development value with
 * a warning. Worker secrets are exposed via env bindings at request time;
 * process.env is the local-Node/dev path (same convention as the API routes).
 */
export function getSecret(
  name: string,
  devFallback: string,
  warnMessage: string
): string {
  const secret = process.env[name];
  if (!secret) {
    console.warn(warnMessage);
    return devFallback;
  }
  return secret;
}

export function base64UrlEncode(input: string | Uint8Array): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return base64UrlEncode(new Uint8Array(sig));
}

/** Constant-time signature comparison (length checked first). Throws on mismatch. */
export function verifyHmacSignature(
  expected: string,
  signature: string,
  errorMessage: string
): void {
  if (expected.length !== signature.length) {
    throw new Error(errorMessage);
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (mismatch !== 0) {
    throw new Error(errorMessage);
  }
}

/** Signs a JSON payload into `<payload>.<signature>`. */
export async function signPayload(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${await hmac(encoded, secret)}`;
}

export interface VerifyPayloadOptions {
  /** Claims that must be truthy (matching the original unsubscribe semantics). */
  requiredClaims?: string[];
  invalidMessage?: string;
  expiredMessage?: string;
}

/**
 * Verifies a token's signature, structure, required claims and expiry,
 * returning the parsed claims. Throws on tampering, malformed input,
 * missing claims or expiry.
 */
export async function verifyPayload<
  T extends Record<string, unknown> = Record<string, unknown>
>(
  token: string,
  secret: string,
  options: VerifyPayloadOptions = {}
): Promise<T> {
  const invalidMessage = options.invalidMessage ?? "Invalid token";
  const expiredMessage = options.expiredMessage ?? "Token has expired";

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(invalidMessage);
  }
  const [payload, signature] = parts;

  const expected = await hmac(payload, secret);
  verifyHmacSignature(expected, signature, invalidMessage);

  let data: Record<string, unknown>;
  try {
    const json = new TextDecoder().decode(base64UrlDecode(payload));
    data = JSON.parse(json);
  } catch {
    throw new Error(invalidMessage);
  }

  for (const claim of options.requiredClaims ?? []) {
    if (!data[claim]) {
      throw new Error(invalidMessage);
    }
  }

  if (typeof data.exp === "number" && data.exp < Date.now()) {
    throw new Error(expiredMessage);
  }

  return data as T;
}
