// API goes to the myshopify domain so it keeps working after thealabanza.com points at this site.
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
const ENDPOINT = `https://${process.env.NEXT_PUBLIC_SHOPIFY_MYSHOPIFY_DOMAIN}/api/2025-10/graphql.json`;
// Shopify-hosted pages (account login, contact/newsletter forms). Set to the checkout subdomain after the domain switch.
export const SHOP_URL = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}`;

// Shared by server components (cached 60s) and the client cart (never cached).
export async function shopify<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate: number | false = 60,
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
    ...(revalidate === false ? { cache: "no-store" as const } : { next: { revalidate } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`Shopify: ${JSON.stringify(json.errors ?? res.status)}`);
  return json.data as T;
}

export type Money = { amount: string; currencyCode: string };
export type Image = { url: string; altText: string | null; width: number; height: number };
export type CardProduct = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: Image | null;
  images: { nodes: Image[] };
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money };
  variants: { nodes: { id: string }[] };
  selectedOrFirstAvailableVariant: { price: Money; compareAtPrice: Money | null } | null;
};

export const CARD = `
fragment Card on Product {
  id handle title availableForSale
  featuredImage { url altText width height }
  images(first: 2) { nodes { url altText width height } }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  variants(first: 2) { nodes { id } }
  selectedOrFirstAvailableVariant { price { amount currencyCode } compareAtPrice { amount currencyCode } }
}`;

// Matches the live theme: "Rs.1,850.00"
export const formatMoney = (m: Money) =>
  "Rs." + Number(m.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Menu URLs come back absolute; make them local links.
export const localUrl = (url: string) => url.replace(/^https?:\/\/[^/]+/, "") || "/";

export type MenuItem = { title: string; url: string; items: MenuItem[] };

export async function getMenu(handle: string) {
  const d = await shopify<{ menu: { items: MenuItem[] } | null }>(
    `query($h:String!){ menu(handle:$h){ items{ title url items{ title url items{ title url } } } } }`,
    { h: handle },
  );
  return (d.menu?.items ?? []).map(function fix(i: MenuItem): MenuItem {
    return { ...i, url: localUrl(i.url), items: (i.items ?? []).map(fix) };
  });
}

export async function getCollectionProducts(handle: string, first = 8) {
  const d = await shopify<{ collection: { products: { nodes: CardProduct[] } } | null }>(
    `${CARD} query($h:String!,$n:Int!){ collection(handle:$h){ products(first:$n){ nodes{ ...Card } } } }`,
    { h: handle, n: first },
  );
  return d.collection?.products.nodes ?? [];
}

export async function getProductsByHandles(handles: string[]) {
  const d = await shopify<Record<string, CardProduct | null>>(
    `${CARD} query{ ${handles.map((h, i) => `p${i}: product(handle:${JSON.stringify(h)}){ ...Card }`).join(" ")} }`,
  );
  return Object.values(d).filter((p): p is CardProduct => !!p);
}
