// Judge.me reviews via its public widget API (server-side). Judge.me's own embed script only works on
// Shopify-hosted themes, so we parse the widget HTML into plain data and render it ourselves.
const TOKEN = process.env.NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN;
const SHOP = process.env.NEXT_PUBLIC_SHOPIFY_MYSHOPIFY_DOMAIN;

export type Review = { id: string; score: number; author: string; body: string; pic: string | null; product: string | null; date: string };
export type ReviewSummary = { rating: number; count: number; reviews: Review[] };

const decode = (s: string) =>
  s.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();

const pick = (html: string, re: RegExp) => html.match(re)?.[1] ?? null;

export function parseReviews(html: string): Review[] {
  return html.split("class='jdgm-rev ").slice(1).map((b) => ({
    id: pick(b, /data-review-id='([^']+)'/) ?? "",
    score: Number(pick(b, /jdgm-rev__rating' data-score='(\d)/) ?? 5),
    author: decode(pick(b, /jdgm-rev__author'>([\s\S]*?)<\/span>/) ?? "Anonymous"),
    body: decode(pick(b, /jdgm-rev__body'>([\s\S]*?)<\/div>/) ?? ""),
    pic: pick(b, /jdgm-rev__pic-img'[^>]*data-src='([^']+)'/)?.replace(/&amp;/g, "&").replace(/width=\d+/, "width=200") ?? null,
    product: decode(pick(b, /jdgm-rev__prod-link'>([\s\S]*?)<\/a>/) ?? "") || null,
    date: pick(b, /jdgm-rev__timestamp[^']*' data-content='([^']+)'/) ?? "",
  }));
}

async function widget<T>(path: string): Promise<T | null> {
  if (!TOKEN || !SHOP) return null;
  try {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`https://judge.me/api/v1/widgets/${path}${sep}api_token=${TOKEN}&shop_domain=${SHOP}`, { next: { revalidate: 300 } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null; // reviews are optional; never break the page
  }
}

export async function getShopReviews(): Promise<ReviewSummary | null> {
  const d = await widget<{ all_reviews: string; all_reviews_header: string }>("all_reviews_page?page=1");
  if (!d) return null;
  return {
    rating: Number(pick(d.all_reviews_header, /data-average-rating='([\d.]+)'/) ?? 0),
    count: Number(pick(d.all_reviews_header, /data-number-of-reviews='(\d+)'/) ?? 0),
    reviews: parseReviews(d.all_reviews),
  };
}

export async function getProductReviews(handle: string): Promise<ReviewSummary | null> {
  const d = await widget<{ widget: string }>(`product_review?handle=${encodeURIComponent(handle)}`);
  if (!d) return null;
  return {
    rating: Number(pick(d.widget, /data-average-rating='([\d.]+)'/) ?? 0),
    count: Number(pick(d.widget, /data-number-of-reviews='(\d+)'/) ?? 0),
    reviews: parseReviews(d.widget),
  };
}
