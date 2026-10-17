// Usage: playwright-cli run-code --filename=shots.js  (edit TARGETS below). Screens both live + local at identical scroll offsets.
async page => {
  const TARGETS = globalThis.TARGETS || [["home", "/", 5]];
  for (const [name, path, n] of TARGETS) {
    for (const [host, dir] of [["http://localhost:3000", "out"]]) {
      await page.goto(host + path);
      await page.waitForTimeout(3000);
      for (let i = 0; i < n; i++) {
        await page.evaluate((y) => scrollTo(0, y), i * 880);
        await page.waitForTimeout(800);
        await page.screenshot({ path: `eval/${dir}/${name}-${page.viewportSize().width}-${i}.png` });
      }
    }
  }
  return "ok";
}
