'use server';

import { siteConfig } from '@/config/site';
import { SubmissionNotificationEmail } from '@/emails/submission-notification';
import { getDB } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { sendEmail } from '../resend';

export async function submitProduct(formData: FormData) {
  try {
    await checkRateLimit();
    await verifyTurnstileToken(
      formData.get('cf-turnstile-response') as string | null
    );

    const productUrl = formData.get('productUrl') as string;

    // Validate input manually
    if (!productUrl || typeof productUrl !== 'string') {
      return {
        success: false,
        error: 'Please enter a valid URL',
      };
    }

    try {
      new URL(productUrl);
    } catch (e) {
      return {
        success: false,
        error: 'Please enter a valid URL',
      };
    }

    // Persist to D1 (best-effort: email notification remains the primary
    // channel, so an insert failure must not block the submission).
    try {
      await getDB()
        ?.prepare('INSERT INTO submissions (product_url) VALUES (?)')
        .bind(productUrl)
        .run();
    } catch (err) {
      console.error('Failed to persist submission to D1:', err);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('ADMIN_EMAIL is not configured');
      return {
        success: false,
        error: 'Submission service is not configured',
      };
    }

    const submittedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Send notification email to admin
    const emailResult = await sendEmail({
      email: adminEmail,
      subject: `[${siteConfig.name}] New Product Submission`,
      react: SubmissionNotificationEmail,
      reactProps: {
        productUrl,
        submittedAt,
      },
    });

    if (!emailResult.success) {
      return {
        success: false,
        error: 'Failed to send submission. Please try again later.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Product submission failed:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    };
  }
}
