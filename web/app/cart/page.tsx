"use client";

import Link from "next/link";
import { CartLines, CheckoutButton, useCart } from "@/components/cart";
import { formatMoney } from "@/lib/shopify";

export default function CartPage() {
  const { cart } = useCart();
  const empty = !cart || cart.totalQuantity === 0;
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-12 md:px-10">
      <h1 className="mb-8 text-[40px] font-bold leading-none md:text-[48px]">Cart</h1>
      {empty ? (
        <div className="py-16 text-center">
          <p className="mb-6 text-[20px] font-bold">Your cart is empty</p>
          <Link href="/collections/xyz" className="inline-flex h-[46px] items-center rounded-lg bg-black px-8 font-medium text-white">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-[1fr_340px]">
          <CartLines />
          <aside className="h-fit space-y-3 rounded-lg bg-[#f5f5f5] p-6">
            <div className="flex justify-between text-base font-bold"><span>Estimated total</span><span>{formatMoney(cart!.cost.subtotalAmount)}</span></div>
            <p className="text-[13px] text-black/60">Taxes and shipping calculated at checkout.</p>
            <CheckoutButton />
          </aside>
        </div>
      )}
    </div>
  );
}
