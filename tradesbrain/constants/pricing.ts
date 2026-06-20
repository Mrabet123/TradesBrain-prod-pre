// TradesBrain Unified Pricing — single source of truth.
// Source: TradesBrain_UnifiedPricing_v1 (Unified Pricing sheet).
//
// THE ALIGNMENT RULE:
//   1. MONTHLY prices use Apple's closest predefined tier — applied IDENTICALLY
//      on iOS, Android, and the Website ($69.99 / $119.99 / $259.99 / $89.99).
//   2. ANNUAL prices stay at their real values on Android, Stripe, and Web
//      (not constrained by Apple tiers).
//   3. The ONLY iOS difference is PLAN AVAILABILITY: Pro Annual & Team Annual
//      are NOT on iOS IAP (the $999.99 annual cap) but ARE available to US iOS
//      users via the Stripe external web-checkout link.
export const PRICING = {
  // monthly = Apple-aligned tier, identical on every platform.
  // annual  = real value (Stripe/Android/Web). monthlyEquivalent = annual / 12.
  solo: { monthly: 69.99, annual: 662.40, monthlyEquivalent: 55.20 },
  pro: { monthly: 119.99, annual: 1152.00, monthlyEquivalent: 96.00 },
  team: { monthly: 259.99, annual: 2496.00, monthlyEquivalent: 208.00 },
  seat: { monthly: 89.99, annual: 854.40, monthlyEquivalent: 71.20 },
} as const;

export const PLAN_FEATURES = {
  solo: { queries: 'Unlimited', reports: true, quotes: true, codeLookup: true, team: false },
  pro: { queries: 'Unlimited', reports: true, quotes: true, codeLookup: true, team: false },
  team: { queries: 'Unlimited', reports: true, quotes: true, codeLookup: true, team: true },
} as const;

// ─── iOS IAP annual availability (Issue 2 / Task 1 — Option A) ───────────────
// Solo Annual is under the $999.99 cap so it ships on IAP. Pro & Team annual
// exceed the cap and are NOT offered through Apple IAP at launch; US iOS users
// reach them via the Stripe external link, and they remain full-price on
// Android/Web. (Option B — requesting higher Apple tiers — runs in parallel;
// flip these to true once Apple approves.)
export const IAP_ANNUAL_AVAILABLE: Record<'solo' | 'pro' | 'team', boolean> = {
  solo: true,
  pro: false,
  team: false,
};

// ─── Transparency copy (Task 4) ─────────────────────────────────────────────
// LINE 2 — shown in the iOS app near the subscription options, the moment a US
// iOS user looks for Pro/Team annual and doesn't find it in IAP. Use verbatim.
export const IOS_ANNUAL_AVAILABILITY_NOTE =
  'Prefer annual billing for Pro or Team? US users can subscribe annually through our web checkout.';

// LINE 1 — for the WEBSITE Pricing page (all plans shown together). Kept here so
// the app and website draw from one source. Use verbatim on the web surface.
export const WEB_ANNUAL_AVAILABILITY_NOTE =
  'Annual billing for Pro and Team is available on web and Android — and for iOS users in the US via web checkout.';
