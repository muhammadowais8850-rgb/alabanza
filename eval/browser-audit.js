async page => {
  const sf = await (await fetch("https://thealabanza.com/api/2025-10/graphql.json", { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": "5cdca5f12dba37ec32bbd9981aa4208f" }, body: JSON.stringify({ query: "{ products(first:250){ nodes{ handle } } collections(first:100){ nodes{ handle } } pages(first:50){ nodes{ handle } } }" }) })).json();
  const prods = sf.data.products.nodes.map((p) => "/products/" + p.handle);
  const paths = ["/", "/cart", "/search?q=necklace", ...sf.data.collections.nodes.map((c) => "/collections/" + c.handle), ...sf.data.pages.nodes.map((p) => "/pages/" + p.handle), ...prods.filter((_, i) => i % 6 === 0)];
  const issues = [];
  page.on("console", (m) => { if (m.type() === "error") issues.push(`[console] ${page.url().replace("http://localhost:3000", "")}: ${m.text().slice(0, 160)}`); });
  page.on("pageerror", (e) => issues.push(`[pageerror] ${page.url()}: ${e.message.slice(0, 160)}`));
  for (const w of [1440, 390]) {
    await page.setViewportSize({ width: w, height: w > 500 ? 900 : 844 });
    for (const p of paths) {
      await page.goto("http://localhost:3000" + p, { waitUntil: "load" });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
      await page.waitForTimeout(700);
      const r = await page.evaluate(() => ({
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getBoundingClientRect().width > 0).map((i) => i.src.slice(0, 90)),
        overflow: document.documentElement.scrollWidth > innerWidth,
        h1: !!document.querySelector("h1"),
        noAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      }));
      if (r.broken.length) issues.push(`[broken-img ${w}] ${p}: ${r.broken.join(", ")}`);
      if (r.overflow) issues.push(`[overflow ${w}] ${p}`);
      if (!r.h1 && p !== "/") issues.push(`[no-h1 ${w}] ${p}`);
      if (r.noAlt) issues.push(`[img-no-alt ${w}] ${p}: ${r.noAlt}`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  return JSON.stringify({ checked: paths.length * 2, issues: [...new Set(issues)] }, null, 1);
}
