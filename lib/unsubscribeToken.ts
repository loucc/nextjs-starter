// ---------------------------------------------------------------------------
// Signed unsubscribe tokens (HMAC-SHA256 via WebCrypto).
//
// Replaces the previous forgeable base64(email) scheme. Token format:
//   <base64url(payload)>.<base64url(signature)>
// where payload = { email, exp } with a 30-day expiry. The crypto is shared
// with the login session tokens — see lib/hmac.ts.
// ---------------------------------------------------------------------------

import { getSecret, signPayload, verifyPayload } from "@/lib/hmac";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DEV_SECRET = "dev-only-unsubscribe-secret-do-not-use-in-production";

function getUnsubscribeSecret(): string {
  return getSecret(
    "UNSUBSCRIBE_SECRET",
    DEV_SECRET,
    "[Unsubscribe] UNSUBSCRIBE_SECRET is not configured — using a development fallback. Set it before production!"
  );
}

/** Produces a signed, expiring unsubscribe token for the given email. */
export async function signUnsubscribeToken(email: string): Promise<string> {
  return signPayload(
    { email, exp: Date.now() + TOKEN_TTL_MS },
    getUnsubscribeSecret()
  );
}

/**
 * Verifies a token's signature and expiry, returning the email it was
 * issued for. Throws on any tampering, malformed input or expiry.
 */
export async function verifyUnsubscribeToken(
  token: string
): Promise<string> {
  const data = await verifyPayload<{ email: string }>(
    token,
    getUnsubscribeSecret(),
    {
      requiredClaims: ["email", "exp"],
      invalidMessage: "Invalid unsubscribe link",
      expiredMessage:
        "This unsubscribe link has expired. Please use a link from a newer email.",
    }
  );
  return data.email;
}
