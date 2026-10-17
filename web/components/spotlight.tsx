"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatMoney, type Money } from "@/lib/shopify";

export type SpotVariant = { id: string; title: string; image: { url: string; altText: string | null } | null; price: Money; compareAtPrice: Money | null };

export const swatch = (v: string) =>
  ({ gold: "#d19b0a", silver: "#d4d4d4", black: "#000", "rose gold": "#e0a899", white: "#fff" })[v.toLowerCase()] ?? "#ccc";

const color = (v: SpotVariant) => v.title.split(" / ")[0];

export function Spotlight({ handle, title, lifestyle, image, variants }: { handle: string; title: string; lifestyle: string; image: SpotVariant["image"]; variants: SpotVariant[] }) {
  const [v, setV] = useState(variants[0]);
  const [picked, setPicked] = useState(false);
  const shown = picked ? v.image : image;
  return (
    <section className="bg-[#eef1ea] md:py-[54px]">
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[720/780]">
          <Image src={lifestyle} alt={title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="px-4 py-8 md:px-10">
          <Link href={`/products/${handle}`} className="flex items-baseline justify-between gap-4">
            <h3 className="text-[14px] font-medium text-black">{title}</h3>
            <span className="text-[12px] font-medium">
              {formatMoney(v.price)}{" "}
              {v.compareAtPrice && Number(v.compareAtPrice.amount) > Number(v.price.amount) && <s className="text-black/40">{formatMoney(v.compareAtPrice)}</s>}
            </span>
          </Link>
          <Link href={`/products/${handle}?variant=${v.id.split("/").pop()}`} className="relative mt-2 block aspect-square">
            {shown && <Image src={shown.url} alt={shown.altText ?? title} fill sizes="(min-width:768px) 45vw, 100vw" className="object-cover" />}
          </Link>
          <div className="mt-4 flex gap-3">
            {variants.filter((x, i, a) => a.findIndex((y) => color(y) === color(x)) === i).map((x) => (
              <button key={x.id} aria-label={x.title} aria-pressed={x.id === v.id} onClick={() => { setV(x); setPicked(true); }}
                className={`h-[26px] w-[26px] rounded-full border border-black/10 ${x.id === v.id ? "ring-1 ring-black ring-offset-2" : ""}`}
                style={{ background: swatch(color(x)) }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
