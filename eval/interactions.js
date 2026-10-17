async page => {
  const L = "http://localhost:3000", log = [], ok = (name, cond, extra = "") => log.push(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
  await page.context().clearCookies();
  await page.goto(L + "/"); await page.evaluate(() => localStorage.clear());
  await page.setViewportSize({ width: 1440, height: 900 });
  // header / nav
  await page.goto(L + "/"); await page.waitForTimeout(2000);
  const a1 = await page.locator("header").first().evaluate((h) => h.previousElementSibling?.innerText);
  await page.getByRole("button", { name: "Next announcement" }).click(); await page.waitForTimeout(300);
  const a2 = await page.locator("header").first().evaluate((h) => h.previousElementSibling?.innerText);
  ok("announcement arrows", a1 !== a2);
  await page.locator("header nav a", { hasText: "Jewelry" }).hover(); await page.waitForTimeout(500);
  ok("mega menu opens", await page.locator("header a", { hasText: "Bracelets" }).isVisible());
  await page.locator("header a", { hasText: "Bracelets" }).click(); await page.waitForURL("**/collections/bracelets");
  ok("mega menu link navigates", page.url().endsWith("/collections/bracelets"));
  await page.getByRole("button", { name: "Search" }).first().click();
  await page.getByRole("textbox", { name: "Search" }).first().fill("watch"); await page.keyboard.press("Enter");
  await page.waitForURL("**/search?q=watch"); await page.waitForTimeout(1500);
  ok("search overlay submits", (await page.locator("main").innerText()).includes("items"));
  // collection filters / sort / grid
  await page.goto(L + "/collections/watches"); await page.waitForTimeout(1500);
  await page.locator("summary", { hasText: "Availability" }).click();
  await page.getByLabel(/In stock/).click(); await page.waitForURL(/filter=/); await page.waitForTimeout(1500);
  ok("availability filter", page.url().includes("filter.v.availability.1"));
  await page.locator("summary", { hasText: "Sort" }).click(); await page.getByRole("button", { name: "Price, high to low" }).click();
  await page.waitForURL(/sort_by=price-descending/); await page.waitForTimeout(1500);
  const prices = await page.locator("main .grid a p + div > span:first-child").allInnerTexts();
  const nums = prices.map((p) => Number(p.replace(/^Rs\.|,/g, "")));
  ok("sort price desc", nums.every((n, i) => i === 0 || nums[i - 1] >= n), nums.slice(0, 4).join(","));
  await page.getByRole("button", { name: "Small grid" }).click();
  ok("grid toggle", (await page.locator("main .grid").first().getAttribute("class")).includes("md:grid-cols-8"));
  // home FAQ + reviews carousel
  await page.goto(L + "/"); await page.waitForTimeout(1500);
  const det = page.locator("details", { hasText: "How long does delivery take?" });
  await det.locator("summary").click(); ok("faq toggles", await det.evaluate((d) => d.open));
  ok("reviews carousel present", await page.getByText(/from \d+ reviews/).isVisible());
  // quick add: single-variant product from a collection card
  await page.goto(L + "/collections/bags"); await page.waitForTimeout(1500);
  const quick = page.locator("button[aria-label^='Add ']").first();
  const quickName = await quick.getAttribute("aria-label");
  await quick.click({ force: true }); await page.waitForTimeout(3000);
  ok("quick add opens drawer", await page.locator("aside[role=dialog]").evaluate((e) => e.className.includes("translate-x-0")), quickName);
  await page.keyboard.press("Escape");
  // multi-variant, non-personalized
  await page.goto(L + "/products/jewelry"); await page.waitForTimeout(2000);
  const nm = await page.getByPlaceholder(/e\.g\./).count();
  if (nm) await page.getByPlaceholder(/e\.g\./).first().fill("Ali Khan");
  await page.getByRole("button", { name: "Add to cart" }).click(); await page.waitForTimeout(3000);
  const drawer = await page.locator("aside[role=dialog]").innerText();
  ok("personalized add keeps name", drawer.includes("Ali Khan"), drawer.match(/Cart · \d+/)?.[0]);
  // remove line
  const before = (drawer.match(/Cart · (\d+)/) || [])[1];
  await page.locator("aside button", { hasText: "Remove" }).first().click(); await page.waitForTimeout(2500);
  const after = ((await page.locator("aside[role=dialog]").innerText()).match(/Cart · (\d+)/) || [])[1];
  ok("remove line", before !== after, `${before} -> ${after}`);
  await page.keyboard.press("Escape");
  // buy it now goes to checkout
  await page.goto(L + "/products/emerald-original"); await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Buy it now" }).click(); await page.waitForURL(/checkouts/, { timeout: 20000 }).catch(() => {});
  ok("buy it now -> checkout", /checkouts/.test(page.url()));
  // cart checkout
  await page.goto(L + "/cart"); await page.waitForTimeout(2000);
  const href = await page.locator("main a", { hasText: "Check out" }).getAttribute("href").catch(() => null);
  if (href) { await page.goto(href); await page.waitForTimeout(5000); }
  ok("cart checkout -> Shopify", /checkouts/.test(page.url()));
  // mobile menu + gallery
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(L + "/"); await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Open Watches" }).click();
  await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Watches For Men" }).click();
  await page.waitForURL("**/collections/watches-for-men"); ok("mobile submenu navigates", true);
  await page.goto(L + "/products/two-halves-one-heart"); await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Black" }).first().click(); await page.waitForTimeout(1200);
  ok("variant swatch updates URL", /variant=\d+/.test(page.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  // newsletter + contact forms point to Shopify
  await page.goto(L + "/pages/contact");
  ok("contact form -> Shopify", (await page.locator("main form").getAttribute("action")).startsWith("https://thealabanza.com/contact"));
  ok("404 page", (await page.goto(L + "/products/does-not-exist")).status() === 404);
  return log.join("\n");
}
