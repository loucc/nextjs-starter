import { siteConfig } from '@/config/site';
import { NewsletterWelcomeEmail } from '@/emails/newsletter-welcome';
import { normalizeEmail, validateEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import {
  signUnsubscribeToken,
  verifyUnsubscribeToken as verifyToken,
} from '@/lib/unsubscribeToken';
import {
  addContactToAudience,
  getContactsFromAudience,
  removeContactFromAudience,
  sendEmail,
} from '../resend';

export async function subscribeToNewsletter(
  email: string,
  turnstileToken?: string | null
) {
  try {
    await checkRateLimit();
    await verifyTurnstileToken(turnstileToken);

    const normalizedEmail = normalizeEmail(email);
    const { isValid, error } = validateEmail(normalizedEmail);

    if (!isValid) {
      throw new Error(error || 'Invalid email address');
    }

    // Add to audience
    await addContactToAudience(normalizedEmail);

    // Build unsubscribe link (signed token, 30-day expiry)
    const unsubscribeToken = await signUnsubscribeToken(normalizedEmail);
    const unsubscribeLink = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?token=${unsubscribeToken}`;

    // Send welcome email
    await sendEmail({
      email: normalizedEmail,
      subject: `Welcome to ${siteConfig.name}`,
      react: NewsletterWelcomeEmail,
      reactProps: {
        email: normalizedEmail,
        unsubscribeLink,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Newsletter subscription failed:', error);
    throw error;
  }
}

export async function unsubscribeFromNewsletter(token: string) {
  try {
    await checkRateLimit();

    const email = await verifyToken(token);
    const normalizedEmail = normalizeEmail(email);
    const { isValid, error } = validateEmail(normalizedEmail);

    if (!isValid) {
      throw new Error(error || 'Invalid email address');
    }

    // Check if subscribed
    const { data: contacts } = await getContactsFromAudience();
    if (contacts) {
      const user = contacts.find((item: { email: string }) => item.email === normalizedEmail);
      if (!user) {
        throw new Error('This email is not subscribed to our notifications');
      }
    }

    // Remove from audience
    await removeContactFromAudience(normalizedEmail);

    return { success: true, email: normalizedEmail };
  } catch (error) {
    console.error('Newsletter unsubscribe failed:', error);
    throw error;
  }
}
