// Which engraving form a product shows. Mirrors the product's theme template suffix in Shopify admin.
// shortcut: hard-coded from Admin API on 2026-10-16 (writing a storefront-visible metafield was blocked);
// upgrade to a `custom.personalization` metafield read via Storefront API when new personalized products are added.
export type Personalization = "personalized" | "couple-engraving";

const COUPLE = ["two-halves-one-heart"];
const PERSONALIZED = `custom-eye-sketch-engraved-pendant-necklace jewelry custom-name-bracelet personalized-name-initial-rings-for-women
personalized-photo-engraved-coin-necklace personalized-nikkah-wedding-gift-frame customized-angel-wings-name-necklace-personalized-heart-pendant-for-couples
custom-name-watch custom-name-gift-set personalized-gold-baby-bracelet luxury-name-necklace couple-name-promise-ring matching-couple-rings
butterfly-name-necklace couple-name-necklace fairy-name-necklace custom-name-necklace custom-couple-name-ring personalized-matching-name-ring
crown-style-couple-name-ring crown-name-necklace couple-name-ring single-name-ring personalized-double-name-ring infinity-name-ring double-name-ring
butterfly-letter-necklace custom-name-pendant heart-name-necklace butterfly-name-pendant couple-name-necklace-1 personalized-name-necklace
personalized-name-necklace-1 arabic-letter-necklace mouse-name-necklace wings-name-necklace celestial-double-name-ring heart-butterfly-name-necklace
heart-name-necklace-1 couple-name-necklace-2 flower-name-necklace crown-name-necklace-1 personalized-gold-name-pendant personalized-rose-name-necklace
elegant-tulip-name-pendant feather-name-pendant custom-love-name-ring personalized-urdu-name-ring personalized-heartbeat-name-ring
heartbeat-engraved-name-ring forever-name-ring personalized-envelope-necklace custom-engraved-bar-necklace`.split(/\s+/);

export function personalizationFor(handle: string): Personalization | null {
  if (COUPLE.includes(handle)) return "couple-engraving";
  if (PERSONALIZED.includes(handle)) return "personalized";
  return null;
}
