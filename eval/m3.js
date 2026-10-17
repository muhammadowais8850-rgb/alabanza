async page => {
  const out = {};
  for (const host of ["https://thealabanza.com", "http://localhost:3000"]) {
    await page.goto(host + (globalThis.P || "/products/two-halves-one-heart")); await page.waitForTimeout(3000);
    out[host] = await page.evaluate(() => {
      const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
      const vis = (e) => e.getBoundingClientRect().width > 0;
      const find = (re, sel = "main *") => [...document.querySelectorAll(sel)].find((e) => [...e.childNodes].some((n) => n.nodeType === 3 && re.test(n.textContent.trim())) && vis(e));
      const q = (s) => [...document.querySelectorAll(s)].find(vis);
      return {
        h1: box(q("main h1")), price: box(find(/^Rs\.1,850\.00$/)), herColour: box(find(/^Her Colour$/)), swatch: box(q("main [aria-label=Silver], main input[value=Silver] + *, main label[for*=Silver]")),
        hisColour: box(find(/^His Colour$/)), herName: box(find(/^Her Name \(engraving\)$/)), herInput: box(q("main input[placeholder='e.g. Muskan']")),
        hisInput: box(q("main input[placeholder='e.g. Umer']")), design: box(find(/^Choose your design$/)), heart: box(find(/^Heart$/)), finger: box(find(/^Fingerprint$/)),
        qty: box(q("main input[aria-label=Quantity]")), atc: box(find(/^Add to cart$/)), buy: box(find(/^Buy it now$/)), timer: box(find(/^Sale ends in$/i)), offer: box(find(/^Buy 2, Save/)),
        acc: box(find(/^Shipping & Delivery$/)), also: box(find(/^You may also like$/)), img1: q("main img")?.currentSrc?.slice(0, 90),
      };
    });
  }
  return JSON.stringify(out);
}
