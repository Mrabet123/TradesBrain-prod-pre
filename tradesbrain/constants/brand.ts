// constants/brand.ts — TradesBrain brand tokens.
// Single source of truth for brand colours used outside Tailwind classes
// (inline styles, ActivityIndicator tints, PDF HTML, etc.).
//
// Navy is the design system's primary brand colour.
// Source: ../../Design system asset/assets/brand-pack/README.md
// The Tailwind `brand` colour in tailwind.config.js is kept in sync with this.

export const BRAND_NAVY = '#1E3A5F'; // primary — buttons, accents, headings
export const BRAND_NAVY_DARK = '#13283F'; // pressed / hover states
export const BRAND_NAVY_LIGHT = '#3A5E86'; // secondary accent

export const BRAND = {
  navy: BRAND_NAVY,
  navyDark: BRAND_NAVY_DARK,
  navyLight: BRAND_NAVY_LIGHT,
} as const;
