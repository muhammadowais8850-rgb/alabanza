# The Alabanza – headless storefront

Next.js 16 + React 19 + Tailwind 4 pixel-match clone of the Shopify store thealabanza.com (Horizon theme, PKR, Pakistan).
Products, menus, cart and search come live from the Shopify Storefront API; checkout stays on Shopify.
The store owner communicates in Roman Urdu — reply in Roman Urdu.

@web/AGENTS.md

## Layout
- `web/` – the app (run all npm commands here)
  - `lib/shopify.ts` – Storefront API client, card fragment, `formatMoney` ("Rs.1,850.00"), `SHOP_URL`
  - `lib/content.ts` – home/footer/PDP copy; overridable by Shopify metaobject `storefront_content`/`main` (JSON field `content`)
  - `lib/personalization.ts` – which products get which engraving form (mirrors theme template suffix)
  - `lib/listing.ts` – collection/search filters + sort (`?filter=<value id>&min&max&sort_by`)
  - `lib/reviews.ts` – Judge.me reviews fetched server-side and parsed from widget HTML
  - `components/meta-pixel.tsx` – Facebook Pixel (PageView, ViewContent, AddToCart)
  - `deploy.ps1` – Vercel deploy + env upload
- `eval/` – Playwright comparison/test scripts vs the live store (`ref/` live screenshots, `out/` local)
- `backup/` – zip of the live Shopify theme (do not modify)

## Commands
```bash
cd web
npm run dev        # http://localhost:3000 (also .claude/launch.json "alabanza")
npm run check      # assert-based self-check (money format, engraving map, review parser)
npx eslint . && npx tsc --noEmit
npx next build
node ../eval/crawl.mjs [baseUrl]                               # every product/collection/page/link must return 200
playwright-cli run-code --filename=../eval/interactions.js     # 18 UI flows (menus, filters, cart, checkout)
playwright-cli run-code --filename=../eval/browser-audit.js    # console errors, broken images, mobile overflow
```
Deploy (from `web/`, user must be logged in via `npx vercel login` in their own PowerShell):
`powershell -ExecutionPolicy Bypass -File .\deploy.ps1` → https://alabanza-two.vercel.app (project `owais-31fa/alabanza`).

## Env (`web/.env.local`, all public by design)
`NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`, `NEXT_PUBLIC_SHOPIFY_MYSHOPIFY_DOMAIN` (qgbfs7-pf.myshopify.com, used for the API),
`NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` (Shopify-hosted pages: account, contact/newsletter forms), `NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN`, `NEXT_PUBLIC_META_PIXEL_ID`.
Env changes need a dev-server restart; on Vercel they must be added with `--type config` or the CLI refuses token-like names.

## Gotchas
- Pixel parity: Inter is self-hosted from Shopify's files (`app/fonts`, weights 400/500/700 only). Google's Inter is ~3% wider. Never use font-black/semibold — the live theme renders those as 700.
- Measure, don't eyeball: compare element boxes live vs local with the `eval/*.js` measure scripts before changing spacing.
- Cache Components is OFF; data uses `fetch` with `next.revalidate` (60s Shopify, 300s reviews).
- Judge.me's embed script / cache server 404s for headless — keep the server-side parse in `lib/reviews.ts`.
- New personalized products must be added to `lib/personalization.ts` or they show no engraving fields.
- Dev mode (StrictMode) double-fires pixel ViewContent; verify tracking on a production build (`next start`).
- Meta does not send pixel events from automated browsers/localhost; verify by spying on `window.fbq` calls.
- Domain switch plan (DNS on Cloudflare): Shopify primary → `checkout.thealabanza.com`, set `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` to it and redeploy, then apex A `76.76.21.21` + www CNAME `cname.vercel-dns.com`. Rollback: A `23.227.38.65`, www CNAME `shops.myshopify.com`.

## Rules
- Never write to the live Shopify store (metafields, metaobjects, products) or place real orders without explicit approval; checkout tests stop at the Shopify checkout page.
- Never touch the user's Vercel/Shopify/Cloudflare credentials; they log in and change DNS themselves.
