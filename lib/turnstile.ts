import { headers } from "next/headers";

// ---------------------------------------------------------------------------
// Cloudflare Turnstile server-side verification.
//
// Client tokens are single-use and expire after ~5 minutes, so each
// verification is exactly one siteverify call (no retries).
// ---------------------------------------------------------------------------

const SITEVERIFY_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Turnstile token. Throws on missing/invalid token.
 *
 * When TURNSTILE_SECRET_KEY is not configured (local dev / CI) the check is
 * skipped with a warning so the forms keep working — configure the secret
 * before going to production.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined
): Promise<void> {
  if (!token) {
    throw new Error("Security verification is required. Please try again.");
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn(
      "[Turnstile] TURNSTILE_SECRET_KEY is not configured — skipping verification."
    );
    return;
  }

  const headersList = await headers();
  const remoteip =
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim();

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) {
    body.append("remoteip", remoteip);
  }

  let result: { success?: boolean; "error-codes"?: string[] };
  try {
    const res = await fetch(SITEVERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    result = await res.json();
  } catch (err) {
    throw new Error(
      "Security verification service is unavailable. Please try again later."
    );
  }

  if (!result.success) {
    const codes = result["error-codes"]?.join(", ") || "unknown error";
    throw new Error(`Security verification failed (${codes}). Please retry.`);
  }
}
