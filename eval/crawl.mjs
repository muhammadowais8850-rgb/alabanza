// Crawls every product, collection, page and menu link on the local site; reports non-200s and empty pages.
const BASE = process.argv[2] || "http://localhost:3000";
const sf = async (q) => (await (await fetch("https://thealabanza.com/api/2025-10/graphql.json", {
  method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": "5cdca5f12dba37ec32bbd9981aa4208f" },
  body: JSON.stringify({ query: q }) })).json()).data;
const d = await sf(`{ products(first:250){ nodes{ handle } } collections(first:100){ nodes{ handle } } pages(first:50){ nodes{ handle } } }`);
const urls = new Set(["/", "/cart", "/search", "/search?q=ring", "/search?q=zzzznotfound"]);
d.products.nodes.forEach((p) => urls.add(`/products/${p.handle}`));
d.collections.nodes.forEach((c) => urls.add(`/collections/${c.handle}`));
d.pages.nodes.forEach((p) => urls.add(`/pages/${p.handle}`));
const bad = [], linkSet = new Set();
let i = 0;
async function check(u) {
  const t = Date.now();
  const r = await fetch(BASE + u);
  const html = await r.text();
  const ms = Date.now() - t;
  if (r.status !== 200) bad.push(`${r.status} ${u}`);
  else if (u.startsWith("/products/") && !html.includes("Add to cart") && !html.includes("Sold out")) bad.push(`NO-BUY ${u}`);
  else if (/Application error|Unhandled Runtime Error/.test(html)) bad.push(`ERROR ${u}`);
  if (ms > 8000) bad.push(`SLOW ${ms}ms ${u}`);
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) if (!m[1].startsWith("/_next")) linkSet.add(m[1].replace(/&amp;/g, "&"));
}
const list = [...urls];
for (let k = 0; k < list.length; k += 6) await Promise.all(list.slice(k, k + 6).map(check)), (i += 6);
const extra = [...linkSet].filter((l) => !urls.has(l));
for (let k = 0; k < extra.length; k += 6) await Promise.all(extra.slice(k, k + 6).map(check));
console.log(JSON.stringify({ pages: list.length, linksFound: extra.length, products: d.products.nodes.length, collections: d.collections.nodes.length, bad }, null, 1));
