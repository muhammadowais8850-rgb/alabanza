async page => {
  const log = [];
  await page.goto('http://localhost:3000/products/two-halves-one-heart'); await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Add to cart' }).click(); await page.waitForTimeout(800);
  log.push('empty-submit error: ' + (await page.locator('[role=alert]').textContent().catch(() => 'none')));
  await page.getByRole('button', { name: 'Silver' }).click(); await page.waitForTimeout(800);
  log.push('url after Silver: ' + page.url());
  await page.locator('label', { hasText: 'Black' }).first().click();
  await page.getByPlaceholder('e.g. Muskan').fill('Muskan');
  await page.getByPlaceholder('e.g. Umer').fill('Umer');
  await page.locator('label', { hasText: 'Crown' }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click(); await page.waitForTimeout(3500);
  log.push('drawer: ' + (await page.locator('aside[role=dialog]').innerText()).replace(/\s+/g, ' ').slice(0, 400));
  const href = await page.locator('aside a', { hasText: 'Check out' }).getAttribute('href');
  log.push('checkoutUrl: ' + href);
  await page.locator('aside button[aria-label="Increase quantity"]').first().click(); await page.waitForTimeout(2500);
  log.push('after +1: ' + (await page.locator('aside h2').first().innerText()));
  await page.goto('http://localhost:3000/cart'); await page.waitForTimeout(3000);
  log.push('cart page persisted: ' + (await page.locator('main').innerText()).replace(/\s+/g, ' ').slice(0, 200));
  await page.goto(href); await page.waitForTimeout(7000);
  log.push('checkout landed: ' + page.url().slice(0, 80) + ' | title: ' + await page.title());
  log.push('checkout shows engraving: ' + /Muskan/.test(await page.locator('body').innerText()));
  await page.screenshot({ path: 'eval/out/checkout.png' });
  return log.join('\n');
}
