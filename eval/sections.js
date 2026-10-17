async page => {
  const out = [];
  for (const host of ["https://thealabanza.com", "http://localhost:3000"]) {
    await page.goto(host + (globalThis.PATH || "/")); await page.waitForTimeout(2500);
    out.push(await page.evaluate(() => {
      const live = location.host.includes("alabanza");
      const els = live ? [...document.querySelectorAll("main .shopify-section, footer .shopify-section, [id*=footer-group], .shopify-section-group-footer-group")] : [...document.querySelectorAll("main > *, footer > *, footer > div > *")];
      return els.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.top + scrollY), Math.round(r.height), (e.id || e.tagName).slice(-28)]; });
    }));
  }
  return JSON.stringify(out);
}
