import { shopify } from "./shopify";

// Fallback content, copied from the live theme. Any key can be overridden from Shopify admin by creating a
// metaobject of type "storefront_content" with handle "main" and a JSON field "content" holding the same shape.
export const defaults = {
  announcements: [
    "🚚 Free Delivery on Orders Over Rs.2500/-",
    "Cash on Delivery Available Across Pakistan",
    "Easy 15-Day Returns & Exchange",
    "Trusted by 10,000+ Happy Customers ⭐⭐⭐⭐⭐ 4.9",
    "First Check, Then Pay — Order with Confidence",
  ],
  logo: "https://cdn.shopify.com/s/files/1/1007/0723/8180/files/Alabanza_Logo_9b842520-fbb9-4340-b3ef-3e322b9c27d3.png?v=1788910390",
  // Featured products shown in the desktop mega menu, keyed by top-level menu title.
  megaMenuProducts: {
    Jewelry: ["a-versatile-silver-plated-jewelry-ring-to-bracelet-transformation", "square-crystal-necklace", "butterfly-crystal-tennis-bracelet"],
    Watches: ["custom-name-watch", "emerald-original", "poedagar-original-watch"],
  } as Record<string, string[]>,
  hero: {
    heading: "Made Personal Made Unforgettable",
    button: "Shop Now",
    link: "/collections/custom-products-for-men",
    image: "https://cdn.shopify.com/s/files/1/1007/0723/8180/files/Codex_Image_Sep_9_2026_08_46_33_AM.png?v=1788925638",
  },
  productLists: [
    { title: "Design Your Own Piece", collection: "custom-products-for-men", layout: "grid" },
    { title: "Trending Products", collection: "trending-products", layout: "carousel" },
  ],
  spotlight: {
    product: "jewelry",
    image: "https://cdn.shopify.com/s/files/1/1007/0723/8180/files/Customized-Bracelet-Silver.jpg?v=1787925782",
  },
  reviewsHeading: "Let customers speak for us",
  faqHeading: "Frequently Asked Questions",
  faq: [
    ["Do you offer Cash on Delivery?", "Yes. Cash on Delivery is available all across Pakistan. You pay the courier when your parcel is delivered."],
    ["How long does delivery take?", "Orders are dispatched within 1-2 business days and delivered within 4-5 business days across Pakistan. A tracking number is shared once your parcel is on its way."],
    ["Can I return or exchange my order?", "Yes, within 3 days of delivery, as long as the item is unused and in its original condition with packaging and tags. Personalized and sale items are not returnable."],
    ["When will I get my refund?", "Refund claims must be raised within 24 hours of delivery. Once approved, the refund is processed within 24 hours to your bank account, JazzCash or Easypaisa."],
    ["Can I get a personalized or name piece?", "Yes - name necklaces, engraved bars, couple sets and custom bracelets. These are made to order, so they take a little longer to dispatch and cannot be returned or exchanged."],
    ["Will the jewelry tarnish or change colour?", "With proper care our plating lasts long. Keep your jewelry away from water, perfume, lotion and sweat, and store it in a dry pouch or box when you are not wearing it."],
    ["How do I contact customer service?", "Call us at 021-36610101 or WhatsApp 0317-2571079, 7 days a week. You can also email thealabanzaofficial@gmail.com."],
  ] as [string, string][],
  trust: [
    ["returns", "Easy 3-Day Returns", "Changed your mind? Return within 3 days of delivery."],
    ["box", "Open Before You Pay", "Check your parcel at the doorstep before paying."],
    ["truck", "Delivery in 4-5 Days", "Fast, tracked delivery to every city in Pakistan."],
    ["chat", "We Are One Call Away", "Call or WhatsApp us 7 days a week - 021-36610101."],
  ] as [string, string, string][],
  footer: {
    about: "Handpicked jewelry, watches and bags - crafted to help you celebrate the moments and the people that matter most.",
    address: ["Plot 15, Row 1, Sub Block-B, Nazimabad No. 3,", "Karachi, Pakistan"],
    phone: "021-36610101",
    whatsapp: "0317-2571079",
    email: "thealabanzaofficial@gmail.com",
    social: {
      Facebook: "https://www.facebook.com/profile.php?id=61590523686077",
      Instagram: "https://www.instagram.com/thealabanzaofficial",
      Youtube: "https://www.youtube.com/@The.Alabanza",
      Tiktok: "https://www.tiktok.com/@thealabanza.com",
    } as Record<string, string>,
  },
  whatsappUrl: "https://wa.me/923172571079?text=Hi%21+I+need+help+with+an+order+from+The+Alabanza.",
  pdp: {
    // Live theme's repeating 48h "sale ends in" countdown.
    timerAnchor: 1767207600000,
    timerHours: 48,
    offer: ["Buy 2, Save 10% · Buy 3, Save 20%", "Discount applied automatically at checkout"],
    accordions: [
      ["truck", "Shipping & Delivery", "Delivered across Pakistan in 4-5 business days. Free delivery on orders over Rs. 2,500."],
      ["returns", "Returns & Exchanges", "Returns accepted within 3 days of delivery with the original invoice and packaging. Personalized pieces are made to order and cannot be returned. Cash on Delivery available nationwide."],
      ["heart", "Care Instructions", "Avoid contact with water, perfume, and lotion. Store in a dry pouch when not in use to keep it looking new."],
    ] as [string, string, string][],
  },
};

export type Content = typeof defaults;

export async function getContent(): Promise<Content> {
  try {
    const d = await shopify<{ metaobject: { field: { value: string } | null } | null }>(
      `{ metaobject(handle:{type:"storefront_content", handle:"main"}){ field(key:"content"){ value } } }`,
    );
    const v = d.metaobject?.field?.value;
    return v ? { ...defaults, ...JSON.parse(v) } : defaults;
  } catch {
    return defaults; // bad JSON or missing definition must never break the site
  }
}
