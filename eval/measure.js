async page => {
  const out = {};
  for (const host of ["https://thealabanza.com", "http://localhost:3000"]) {
    await page.goto(host + "/"); await page.waitForTimeout(2500);
    out[host] = await page.evaluate(() => {
      const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(), s = getComputedStyle(el); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height), s.fontSize, s.fontWeight, s.lineHeight, s.letterSpacing]; };
      const find = (re, sel = "*") => [...document.querySelectorAll(sel)].find((e) => e.children.length === 0 && re.test(e.textContent.trim()));
      return {
        heroH: box(find(/^Made Personal/)), heroBtn: box(find(/^Shop Now$/)?.closest("a")),
        nav: box(find(/^Jewelry$/, "header nav a, header nav a *")), logo: box(document.querySelector("header img")),
        list1: box(find(/^Design Your Own Piece$/, "h2,h3")), viewAll: box(find(/^View all$/)),
        card1: box(find(/^Personalized Angel Wings Necklace$/)), trending: box(find(/^Trending Products$/, "h2,h3")),
        faqH: box(find(/^Frequently Asked Questions$/)), faq1: box(find(/^Do you offer Cash/)),
        reviewsH: box(find(/^Let customers speak/)), trust: box(find(/^Easy 3-Day Returns$/i)), footer: box(find(/^The Alabanza$/i, "h6,h2,h3")),
        copyright: box(find(/Powered by/)), height: document.body.scrollHeight,
      };
    });
  }
  return JSON.stringify(out);
}
