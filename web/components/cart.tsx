"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { formatMoney, SHOP_URL, shopify, type Money } from "@/lib/shopify";
import { CloseIcon, MinusIcon, PlusIcon } from "./icons";
import { contentId, track } from "./meta-pixel";

export type Attr = { key: string; value: string };
export type CartLine = {
  id: string;
  quantity: number;
  attributes: Attr[];
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    image: { url: string; altText: string | null } | null;
    price: Money;
    compareAtPrice: Money | null;
    product: { id: string; handle: string; title: string };
  };
};
export type Cart = { id: string; checkoutUrl: string; totalQuantity: number; cost: { subtotalAmount: Money }; lines: { nodes: CartLine[] } };

const CART = `fragment C on Cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } }
  lines(first: 100) { nodes { id quantity attributes { key value } cost { totalAmount { amount currencyCode } }
    merchandise { ... on ProductVariant { id title image { url altText } price { amount currencyCode } compareAtPrice { amount currencyCode }
      product { id handle title } } } } } }`;
const KEY = "alabanza_cart_id";

type Ctx = {
  cart: Cart | null;
  open: boolean;
  busy: boolean;
  setOpen: (o: boolean) => void;
  add: (variantId: string, quantity: number, attributes?: Attr[]) => Promise<string | null>;
  update: (lineId: string, quantity: number) => Promise<void>;
};
const CartContext = createContext<Ctx | null>(null);
export const useCart = () => useContext(CartContext)!;

type Mut = { cart: Cart | null; userErrors: { message: string }[] };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let id: string | null = null;
    try { id = localStorage.getItem(KEY); } catch {}
    if (!id) return;
    shopify<{ cart: Cart | null }>(`${CART} query($id:ID!){ cart(id:$id){ ...C } }`, { id }, false)
      // A completed checkout's cart comes back null.
      .then((d) => (d.cart ? setCart(d.cart) : localStorage.removeItem(KEY)))
      .catch(() => {});
  }, []);

  const save = (c: Cart | null) => {
    setCart(c);
    try { if (c) localStorage.setItem(KEY, c.id); } catch {}
  };

  // Returns an error message, or null on success.
  const add = useCallback(async (variantId: string, quantity: number, attributes: Attr[] = []) => {
    setBusy(true);
    try {
      const lines = [{ merchandiseId: variantId, quantity, attributes }];
      const r = cart
        ? (await shopify<{ cartLinesAdd: Mut }>(`${CART} mutation($id:ID!,$l:[CartLineInput!]!){ cartLinesAdd(cartId:$id,lines:$l){ cart{...C} userErrors{message} } }`, { id: cart.id, l: lines }, false)).cartLinesAdd
        : (await shopify<{ cartCreate: Mut }>(`${CART} mutation($l:[CartLineInput!]!){ cartCreate(input:{lines:$l}){ cart{...C} userErrors{message} } }`, { l: lines }, false)).cartCreate;
      if (r.userErrors.length) return r.userErrors[0].message;
      save(r.cart);
      setOpen(true);
      const line = r.cart?.lines.nodes.find((l) => l.merchandise.id === variantId);
      if (line) track("AddToCart", { content_ids: [contentId(line.merchandise.product.id, variantId)], content_name: line.merchandise.product.title, content_type: "product", value: Number(line.merchandise.price.amount) * quantity, currency: line.merchandise.price.currencyCode });
      return null;
    } catch {
      return "Could not add to cart. Please try again.";
    } finally {
      setBusy(false);
    }
  }, [cart]);

  const update = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return;
    setBusy(true);
    try {
      const r = quantity > 0
        ? (await shopify<{ cartLinesUpdate: Mut }>(`${CART} mutation($id:ID!,$l:[CartLineUpdateInput!]!){ cartLinesUpdate(cartId:$id,lines:$l){ cart{...C} userErrors{message} } }`, { id: cart.id, l: [{ id: lineId, quantity }] }, false)).cartLinesUpdate
        : (await shopify<{ cartLinesRemove: Mut }>(`${CART} mutation($id:ID!,$l:[ID!]!){ cartLinesRemove(cartId:$id,lineIds:$l){ cart{...C} userErrors{message} } }`, { id: cart.id, l: [lineId] }, false)).cartLinesRemove;
      if (r.cart) save(r.cart);
    } finally {
      setBusy(false);
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, open, busy, setOpen, add, update }}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function CartCount() {
  const { cart } = useCart();
  const n = cart?.totalQuantity ?? 0;
  return n ? (
    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] leading-none text-white">{n}</span>
  ) : null;
}

export function CartLines({ compact }: { compact?: boolean }) {
  const { cart, update, busy, setOpen } = useCart();
  return (
    <ul className="divide-y divide-black/10">
      {cart?.lines.nodes.map((l) => (
        <li key={l.id} className="flex gap-4 py-5">
          <Link href={`/products/${l.merchandise.product.handle}`} onClick={() => setOpen(false)} className="relative block h-[110px] w-[88px] shrink-0 bg-[#f5f5f5]">
            {l.merchandise.image && <Image src={l.merchandise.image.url} alt={l.merchandise.image.altText ?? l.merchandise.product.title} fill sizes="88px" className="object-cover" />}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex justify-between gap-3">
              <Link href={`/products/${l.merchandise.product.handle}`} onClick={() => setOpen(false)} className="font-medium">{l.merchandise.product.title}</Link>
              <span className="shrink-0">{formatMoney(l.cost.totalAmount)}</span>
            </div>
            <div className="text-[13px] text-black/60">
              <span>{formatMoney(l.merchandise.price)}</span>
              {l.merchandise.compareAtPrice && Number(l.merchandise.compareAtPrice.amount) > Number(l.merchandise.price.amount) && (
                <s className="ml-1">{formatMoney(l.merchandise.compareAtPrice)}</s>
              )}
            </div>
            {l.merchandise.title !== "Default Title" && <p className="text-[13px] text-black/60">{l.merchandise.title}</p>}
            {l.attributes.map((a) => (
              <p key={a.key} className="text-[13px] text-black/60">{a.key}: {a.value}</p>
            ))}
            <div className={`mt-2 flex items-center gap-4 ${compact ? "" : "md:mt-3"}`}>
              <div className="flex h-10 items-center rounded-full border border-black/15">
                <button aria-label="Decrease quantity" disabled={busy} onClick={() => update(l.id, l.quantity - 1)} className="px-3"><MinusIcon /></button>
                <span className="w-6 text-center">{l.quantity}</span>
                <button aria-label="Increase quantity" disabled={busy} onClick={() => update(l.id, l.quantity + 1)} className="px-3"><PlusIcon /></button>
              </div>
              <button disabled={busy} onClick={() => update(l.id, 0)} className="text-[13px] underline">Remove</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CheckoutButton() {
  const { cart } = useCart();
  if (!cart) return null;
  return (
    <a href={cart.checkoutUrl} className="flex h-12 w-full items-center justify-center rounded-lg bg-black font-medium text-white">
      Check out
    </a>
  );
}

function CartDrawer() {
  const { cart, open, setOpen } = useCart();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, setOpen]);
  const empty = !cart || cart.totalQuantity === 0;
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside role="dialog" aria-label="Cart" className={`absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col bg-white transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-lg font-bold">{empty ? "" : `Cart · ${cart!.totalQuantity}`}</h2>
          <button aria-label="Close" onClick={() => setOpen(false)}><CloseIcon /></button>
        </div>
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p>Have an account? <a href={`${SHOP_URL}/account/login`} className="underline">Log in</a> to check out faster.</p>
            <button onClick={() => setOpen(false)} className="mt-2 h-[46px] rounded-lg bg-black px-8 font-medium text-white">Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6"><CartLines compact /></div>
            <div className="space-y-3 border-t border-black/10 px-6 py-5">
              <div className="flex justify-between text-base font-bold"><span>Estimated total</span><span>{formatMoney(cart!.cost.subtotalAmount)}</span></div>
              <p className="text-[13px] text-black/60">Taxes and shipping calculated at checkout.</p>
              <CheckoutButton />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
