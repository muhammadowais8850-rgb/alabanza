import { CARD, shopify, type CardProduct } from "./shopify";

export type FilterValue = { id: string; label: string; count: number; input: string };
export type Filter = { id: string; label: string; type: "LIST" | "PRICE_RANGE" | "BOOLEAN"; values: FilterValue[] };
export type Params = Record<string, string | string[] | undefined>;

// Same sort_by values as the Shopify theme, so old links keep working.
export const SORTS: Record<string, [string, string, boolean]> = {
  manual: ["Featured", "COLLECTION_DEFAULT", false],
  "best-selling": ["Best selling", "BEST_SELLING", false],
  "title-ascending": ["Alphabetically, A-Z", "TITLE", false],
  "title-descending": ["Alphabetically, Z-A", "TITLE", true],
  "price-ascending": ["Price, low to high", "PRICE", false],
  "price-descending": ["Price, high to low", "PRICE", true],
  "created-ascending": ["Date, old to new", "CREATED", false],
  "created-descending": ["Date, new to old", "CREATED", true],
};

const all = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

// URL params: filter=<filter value id> (repeatable), min / max for price, sort_by.
function toProductFilters(filters: Filter[], p: Params) {
  const picked = all(p.filter);
  const out: unknown[] = filters.flatMap((f) => f.values).filter((v) => picked.includes(v.id)).map((v) => JSON.parse(v.input));
  const min = Number(p.min), max = Number(p.max);
  if (p.min || p.max) out.push({ price: { ...(p.min && !isNaN(min) ? { min } : {}), ...(p.max && !isNaN(max) ? { max } : {}) } });
  return out;
}

type Conn = { filters: Filter[]; nodes: CardProduct[] };

// shortcut: loads up to 250 products per listing with no pagination; the whole catalog is ~130 products. Add cursor paging past 250.
export async function getCollectionListing(handle: string, p: Params) {
  const base = await shopify<{ collection: { title: string; description: string; descriptionHtml: string; image: { url: string } | null; products: { filters: Filter[] } } | null }>(
    `query($h:String!){ collection(handle:$h){ title description descriptionHtml image{url} products(first:1){ filters{ id label type values{ id label count input } } } } }`,
    { h: handle },
  );
  if (!base.collection) return null;
  const filters = base.collection.products.filters;
  const [, key, reverse] = SORTS[String(p.sort_by)] ?? SORTS.manual;
  const d = await shopify<{ collection: { products: Conn } }>(
    `${CARD} query($h:String!,$f:[ProductFilter!],$s:ProductCollectionSortKeys,$r:Boolean){ collection(handle:$h){ products(first:250,filters:$f,sortKey:$s,reverse:$r){ nodes{ ...Card } } } }`,
    { h: handle, f: toProductFilters(filters, p), s: key, r: reverse },
  );
  return { ...base.collection, filters, products: d.collection.products.nodes };
}

export async function getSearchListing(q: string, p: Params) {
  const base = await shopify<{ search: { productFilters: Filter[] } }>(
    `query($q:String!){ search(query:$q, first:1, types:PRODUCT){ productFilters{ id label type values{ id label count input } } } }`,
    { q },
  );
  const filters = base.search.productFilters;
  const sort = String(p.sort_by);
  const key = sort.startsWith("price") ? "PRICE" : "RELEVANCE";
  const d = await shopify<{ search: { nodes: CardProduct[] } }>(
    `${CARD} query($q:String!,$f:[ProductFilter!],$s:SearchSortKeys,$r:Boolean){ search(query:$q, first:100, types:PRODUCT, productFilters:$f, sortKey:$s, reverse:$r){ nodes{ ...on Product{ ...Card } } } }`,
    { q, f: toProductFilters(filters, p), s: key, r: sort === "price-descending" },
  );
  return { filters, products: d.search.nodes };
}
