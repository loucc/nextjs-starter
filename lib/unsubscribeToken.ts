// ---------------------------------------------------------------------------
// Signed unsubscribe tokens (HMAC-SHA256 via WebCrypto).
//
// Replaces the previous forgeable base64(email) scheme. Token format:
//   <base64url(payload)>.<base64url(signature)>
// where payload = { email, exp } with a 30-day expiry. WebCrypto is used so
// the code runs on Cloudflare Workers as well as the Node dev server.
// ---------------------------------------------------------------------------

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DEV_SECRET = "dev-only-unsubscribe-secret-do-not-use-in-production";

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    console.warn(
      "[Unsubscribe] UNSUBSCRIBE_SECRET is not configured — using a development fallback. Set it before production!"
    );
    return DEV_SECRET;
  }
  return secret;
}

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmac(payload: string, secret: string): Promise<string> {
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

/** Produces a signed, expiring unsubscribe token for the given email. */
export async function signUnsubscribeToken(email: string): Promise<string> {
  const payload = base64UrlEncode(
    JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS })
  );
  const signature = await hmac(payload, getSecret());
  return `${payload}.${signature}`;
}

/**
 * Verifies a token's signature and expiry, returning the email it was
 * issued for. Throws on any tampering, malformed input or expiry.
 */
export async function verifyUnsubscribeToken(
  token: string
): Promise<string> {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Invalid unsubscribe link");
  }
  const [payload, signature] = parts;

  const expected = await hmac(payload, getSecret());
  if (expected.length !== signature.length) {
    throw new Error("Invalid unsubscribe link");
  }
  // Constant-time comparison (length checked above).
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (mismatch !== 0) {
    throw new Error("Invalid unsubscribe link");
  }

  let data: { email?: string; exp?: number };
  try {
    const json = new TextDecoder().decode(base64UrlDecode(payload));
    data = JSON.parse(json);
  } catch {
    throw new Error("Invalid unsubscribe link");
  }

  if (!data.email || !data.exp) {
    throw new Error("Invalid unsubscribe link");
  }
  if (data.exp < Date.now()) {
    throw new Error(
      "This unsubscribe link has expired. Please use a link from a newer email."
    );
  }

  return data.email;
}
