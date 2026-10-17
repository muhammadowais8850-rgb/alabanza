async page => {
  const out = {};
  for (const host of ["https://thealabanza.com", "http://localhost:3000"]) {
    await page.goto(host + "/collections/watches"); await page.waitForTimeout(2500);
    out[host] = await page.evaluate(() => {
      const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
      const find = (re) => [...document.querySelectorAll("main *")].find((e) => e.children.length === 0 && re.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0);
      return { h1: box(find(/^Watches$/)), avail: box(find(/^Availability$/)), items: box(find(/items$/)), card: box(find(/^Couple Watch Set$/)), img: box(document.querySelector("main img")), price: box(find(/^Rs\.1,800\.00$/)) };
    });
  }
  return JSON.stringify(out);
}
