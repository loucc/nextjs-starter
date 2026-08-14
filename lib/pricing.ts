import { siteConfig } from "@/config/site";

export type PricingPlanId = "free" | "pro" | "business";

/**
 * Resolves the CTA target for a plan:
 * - free → site root
 * - pro → NEXT_PUBLIC_PRICING_CHECKOUT_URL (fallback: site root)
 * - business → mailto contact
 */
export function getPlanActionUrl(
  plan: PricingPlanId,
  checkoutUrl = process.env.NEXT_PUBLIC_PRICING_CHECKOUT_URL
): string {
  if (plan === "pro") {
    return checkoutUrl || "/";
  }
  if (plan === "business") {
    const email = siteConfig.socialLinks?.email;
    return email ? `mailto:${email}` : "/";
  }
  return "/";
}
