'use server';

import { getDB } from '@/lib/db';
import { normalizeEmail, validateEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyTurnstileToken } from '@/lib/turnstile';

/**
 * Joins the waitlist. The waitlist has no email fallback channel — it
 * requires D1 to be configured.
 */
export async function joinWaitlist(formData: FormData) {
  try {
    await checkRateLimit();
    await verifyTurnstileToken(
      formData.get('cf-turnstile-response') as string | null
    );

    const rawEmail = formData.get('email') as string;
    const normalizedEmail = normalizeEmail(rawEmail);
    const { isValid, error } = validateEmail(normalizedEmail);

    if (!isValid) {
      return {
        success: false,
        error: error || 'invalid_email_format',
      };
    }

    const db = getDB();
    if (!db) {
      console.error('D1 is not configured — waitlist join rejected');
      return { success: false, error: 'notConfigured' };
    }

    try {
      await db
        .prepare('INSERT INTO waitlist (email) VALUES (?)')
        .bind(normalizedEmail)
        .run();
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes('UNIQUE')
      ) {
        return { success: false, error: 'alreadyJoined' };
      }
      console.error('Failed to persist waitlist entry:', err);
      return { success: false, error: 'errorMessage' };
    }

    return { success: true };
  } catch (error) {
    console.error('Waitlist join failed:', error);
    return { success: false, error: 'errorMessage' };
  }
}
