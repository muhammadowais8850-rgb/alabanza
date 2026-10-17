"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Personalization } from "@/lib/personalization";
import { formatMoney, shopify, type Money } from "@/lib/shopify";
import { type Attr, useCart } from "./cart";
import { BagPlusIcon, MinusIcon, PlusIcon } from "./icons";
import { contentId, track } from "./meta-pixel";
import { swatch } from "./spotlight";

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  compareAtPrice: Money | null;
  image: { url: string } | null;
};
export type Option = { name: string; optionValues: { name: string; swatch: { color: string | null } | null }[] };

const isColor = (name: string) => /colou?r/i.test(name);

// Engraving fields per theme template. Keys are the exact line-item property names the live theme sends.
const DESIGNS = [["Aa", "Names only"], ["❤️", "Heart"], ["💓", "Heartbeat"], ["👑", "Crown"], ["☝️", "Fingerprint"]];
const TEXT_FIELDS: Record<Personalization, { key: string; desc: string; placeholder: string }[]> = {
  personalized: [{ key: "Name to engrave", desc: "Write the exact name(s) and spelling you want on the piece.", placeholder: "e.g. Umer & Muskan" }],
  "couple-engraving": [
    { key: "Her Name (engraving)", desc: "Name for the women's half-heart piece. Write the exact spelling.", placeholder: "e.g. Muskan" },
    { key: "His Name (engraving)", desc: "Name for the men's half-heart piece. Write the exact spelling.", placeholder: "e.g. Umer" },
  ],
};

export function ProductForm({ productId, title, options, variants, personalization }: { productId: string; title: string; options: Option[]; variants: Variant[]; personalization: Personalization | null }) {
  const { add, busy } = useCart();
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initial = variants.find((v) => v.id.endsWith(`/${sp.get("variant")}`)) ?? variants.find((v) => v.availableForSale) ?? variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(Object.fromEntries(initial.selectedOptions.map((o) => [o.name, o.value])));
  const [qty, setQty] = useState(1);
  const [props, setProps] = useState<Record<string, string>>(
    personalization === "couple-engraving" ? { "His Colour": "Gold", Design: "Names only" } : {},
  );
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  const variant = variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value));
  const realOptions = options.filter((o) => !(o.optionValues.length === 1 && o.optionValues[0].name === "Default Title"));

  // Keep ?variant= in the URL like the theme does, and let the gallery jump to the variant image.
  useEffect(() => {
    if (!variant) return;
    const id = variant.id.split("/").pop()!;
    if (sp.get("variant") !== id && realOptions.length) router.replace(`${pathname}?variant=${id}`, { scroll: false });
    if (variant.image) window.dispatchEvent(new CustomEvent("variant-image", { detail: variant.image.url }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant?.id]);

  const attributes = (): Attr[] | null => {
    for (const f of personalization ? TEXT_FIELDS[personalization] : []) {
      if (!props[f.key]?.trim()) {
        setError(`Please fill in "${f.key}".`);
        document.getElementById(`prop-${f.key}`)?.focus();
        return null;
      }
    }
    setError(null);
    const design = DESIGNS.find(([, label]) => label === props.Design);
    return Object.entries(props).map(([key, value]) => ({ key, value: key === "Design" && design && design[1] !== "Names only" ? `${value} ${design[0]}` : value.trim() }));
  };

  const addToCart = async () => {
    const a = attributes();
    if (!a || !variant) return;
    setError(await add(variant.id, qty, a));
  };

  // "Buy it now" skips the saved cart and goes straight to checkout with just this item.
  const buyNow = async () => {
    const a = attributes();
    if (!a || !variant) return;
    setBuying(true);
    try {
      const d = await shopify<{ cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] } }>(
        `mutation($l:[CartLineInput!]!){ cartCreate(input:{lines:$l}){ cart{ checkoutUrl } userErrors{ message } } }`,
        { l: [{ merchandiseId: variant.id, quantity: qty, attributes: a }] },
        false,
      );
      if (d.cartCreate.cart) window.location.href = d.cartCreate.cart.checkoutUrl;
      else setError(d.cartCreate.userErrors[0]?.message ?? "Something went wrong.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBuying(false);
    }
  };

  const shown = variant ?? initial;
  useEffect(() => {
    track("ViewContent", { content_ids: [contentId(productId, initial.id)], content_name: title, content_type: "product", value: Number(initial.price.amount), currency: initial.price.currencyCode });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per product view
  }, [productId]);
  const soldOut = !variant?.availableForSale;
  return (
    <div>
      <h1 className="text-[32px] font-bold leading-[1.1]">{title}</h1>
      <p className="mt-[10px] text-[14px]">
        {formatMoney(shown.price)}{" "}
        {shown.compareAtPrice && Number(shown.compareAtPrice.amount) > Number(shown.price.amount) && <s className="text-black/40">{formatMoney(shown.compareAtPrice)}</s>}
      </p>
      <hr className="my-5 border-black/10" />

      {realOptions.map((o) => (
        <fieldset key={o.name} className="mb-6">
          <legend className="mb-2 text-[14px]">{o.name} <span className="ml-1 text-black/70">{selected[o.name]}</span></legend>
          <div className="flex flex-wrap gap-[10px]">
            {o.optionValues.map((v) => {
              const on = selected[o.name] === v.name;
              const available = variants.some((x) => x.availableForSale && x.selectedOptions.every((so) => (so.name === o.name ? so.value === v.name : selected[so.name] === so.value)));
              return isColor(o.name) ? (
                <button key={v.name} type="button" aria-label={v.name} aria-pressed={on} onClick={() => setSelected({ ...selected, [o.name]: v.name })}
                  className={`h-[34px] w-[34px] rounded-full border border-black/10 ${on ? "ring-1 ring-black ring-offset-2" : ""} ${available ? "" : "opacity-40"}`}
                  style={{ background: v.swatch?.color ?? swatch(v.name) }} />
              ) : (
                <button key={v.name} type="button" aria-pressed={on} onClick={() => setSelected({ ...selected, [o.name]: v.name })}
                  className={`rounded-full border px-4 py-2 text-[14px] ${on ? "border-black bg-black text-white" : "border-black/15"} ${available ? "" : "line-through opacity-50"}`}>
                  {v.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {personalization === "couple-engraving" && (
        <fieldset className="mb-[34px] mt-8">
          <legend className="mb-3 text-[15.2px]">His Colour <span className="text-black/50">— for the men’s half</span></legend>
          <div className="flex flex-wrap gap-2">
            {["Gold", "Silver", "Black"].map((c) => {
              const on = props["His Colour"] === c;
              return (
                <label key={c} className={`flex h-[39px] cursor-pointer items-center gap-2 rounded-full border px-[13px] text-[13px] ${on ? "border-black bg-black/[0.04] font-bold" : "border-black/15"}`}>
                  <input type="radio" name="His Colour" value={c} checked={on} onChange={() => setProps({ ...props, "His Colour": c })} className="sr-only" />
                  <span className="h-[14px] w-[14px] rounded-full border border-black/10" style={{ background: swatch(c) }} />{c}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {personalization && TEXT_FIELDS[personalization].map((f) => (
        <div key={f.key} className="mt-7">
          <label htmlFor={`prop-${f.key}`} className="block text-[14px]">{f.key}</label>
          <p className="mb-[10px] mt-[6px] text-[11.9px] text-black/70">{f.desc}</p>
          <input id={`prop-${f.key}`} required maxLength={40} placeholder={f.placeholder} value={props[f.key] ?? ""}
            onChange={(e) => setProps({ ...props, [f.key]: e.target.value })}
            className="h-12 w-full rounded-[4px] border border-black/15 px-[13px] text-[14px] outline-none placeholder:text-black/80 focus:border-black" />
        </div>
      ))}

      {personalization === "couple-engraving" && (
        <fieldset className="mb-8 mt-9">
          <legend className="mb-[7px] text-[15.2px]">Choose your design <span className="text-black/50">— engraved along with the names</span></legend>
          <div className="grid grid-cols-4 justify-items-start gap-y-[9px]">
            {DESIGNS.map(([icon, label]) => {
              const on = props.Design === label;
              return (
                <label key={label} className={`flex cursor-pointer flex-col items-center rounded-lg border px-[6px] pb-[6px] pt-[4px] text-[13px] ${on ? "border-black font-bold" : "border-black/15"}`}>
                  <input type="radio" name="Design" value={label} checked={on} onChange={() => setProps({ ...props, Design: label })} className="sr-only" />
                  <b className="text-[23.2px] font-normal leading-8">{icon}</b>{label}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-8 flex gap-3">
        <div className="flex h-[52px] w-[126px] shrink-0 items-center justify-between rounded-lg border border-black/15 px-4">
          <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(qty - 1)} className="disabled:opacity-30"><MinusIcon /></button>
          <input aria-label="Quantity" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-8 text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
          <button type="button" aria-label="Increase quantity" onClick={() => setQty(qty + 1)}><PlusIcon /></button>
        </div>
        <button type="button" onClick={addToCart} disabled={busy || soldOut}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-lg bg-black text-[14px] font-medium text-white disabled:opacity-60">
          {!soldOut && <BagPlusIcon />}{soldOut ? (variant ? "Sold out" : "Unavailable") : "Add to cart"}
        </button>
      </div>
      {!soldOut && (
        <button type="button" onClick={buyNow} disabled={buying}
          className="mt-[11px] h-[52px] w-full rounded-lg bg-black text-[14px] font-medium text-white disabled:opacity-60">
          {buying ? "…" : "Buy it now"}
        </button>
      )}
      {error && <p role="alert" className="mt-3 text-[13px] text-red-600">{error}</p>}
    </div>
  );
}
