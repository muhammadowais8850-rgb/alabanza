async page => {
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`[${m.type()}] ${page.url().replace('http://localhost:3000', '')}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => errs.push(`[pageerror] ${page.url()}: ${e.message.slice(0, 200)}`));
  const paths = ['/', '/collections/watches', '/collections/xyz', '/collections/bags', '/products/custom-name-necklace', '/products/two-halves-one-heart', '/products/emerald-original', '/search?q=ring', '/pages/contact', '/pages/shipping-policy', '/cart'];
  for (const w of [1440, 390]) {
    await page.setViewportSize({ width: w, height: w > 500 ? 900 : 844 });
    for (const p of paths) { await page.goto('http://localhost:3000' + p); await page.waitForTimeout(2000); }
  }
  // overflow check at phone width
  const overflow = [];
  for (const p of paths) { await page.goto('http://localhost:3000' + p); await page.waitForTimeout(1200); const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > 390) overflow.push(p + ':' + sw); }
  await page.setViewportSize({ width: 1440, height: 900 });
  return JSON.stringify({ errs: [...new Set(errs)], overflow }, null, 1);
}
