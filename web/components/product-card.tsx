"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CardProduct } from "@/lib/shopify";
import { personalizationFor } from "@/lib/personalization";
import { useCart } from "./cart";
import { BagPlusIcon } from "./icons";
import { onSale, Price } from "./price";

export function ProductCard({ p, sizes = "(min-width: 768px) 25vw, 50vw", priority }: { p: CardProduct; sizes?: string; priority?: boolean }) {
  const { add, busy } = useCart();
  const router = useRouter();
  const href = `/products/${p.handle}`;
  const [img = p.featuredImage, hoverImg] = p.images.nodes;
  // Products with options or engraving need the product page; single-variant ones add straight to cart.
  const direct = p.variants.nodes.length === 1 && !personalizationFor(p.handle);
  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
        <Link href={href} className="absolute inset-0" aria-label={p.title}>
          {img && <Image src={img.url} alt={img.altText ?? p.title} fill sizes={sizes} priority={priority} className="object-cover" />}
          {hoverImg && <Image src={hoverImg.url} alt="" fill sizes={sizes} className="object-cover opacity-0 transition-opacity duration-300 md:group-hover:opacity-100" />}
        </Link>
        {onSale(p) && <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-white px-2 py-0.5 text-[12px] leading-5 md:px-[10px] md:py-[3px] md:text-[14px] md:leading-[22px]">Sale</span>}
        {!p.availableForSale && <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[12px] leading-5 md:px-[10px] md:py-[3px] md:text-[14px] md:leading-[22px]">Sold out</span>}
        {p.availableForSale && (
          <button
            aria-label={direct ? `Add ${p.title} to cart` : `Choose options for ${p.title}`}
            disabled={busy}
            onClick={() => (direct ? add(p.variants.nodes[0].id, 1) : router.push(href))}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
          >
            <BagPlusIcon />
          </button>
        )}
      </div>
      <Link href={href} className="block">
        <p className="mt-3 text-[14px] leading-[22.4px]">{p.title}</p>
        <Price p={p} className="text-[12px] font-medium leading-[14.4px]" />
      </Link>
    </div>
  );
}
