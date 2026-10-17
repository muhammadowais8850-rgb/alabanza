# The Alabanza – headless storefront

Next.js 16 + Tailwind clone of thealabanza.com. Products, collections, menus, cart and search come live from the Shopify Storefront API; checkout stays on Shopify.

```bash
npm install
npm run dev      # http://localhost:3000
npm run check    # helper self-check
```

`.env.local` needs `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` (Headless channel, public token). `NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN` (Judge.me public token) turns on reviews; they are fetched server-side in `lib/reviews.ts` (Judge.me embed script only works on Shopify themes). Set the same env vars on your host when deploying.

- Home banners, FAQ, footer text, timer, etc.: `lib/content.ts`. Override any key without a deploy by creating a Shopify metaobject `storefront_content` / handle `main` with a JSON field `content`.
- Engraving forms per product: `lib/personalization.ts` (mirrors the theme template suffix).
- Visual comparison scripts against the live site: `../eval/` (run with `playwright-cli run-code --filename=...`).
