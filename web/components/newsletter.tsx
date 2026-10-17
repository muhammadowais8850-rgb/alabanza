"use client";

import { useState } from "react";
import { SHOP_URL } from "@/lib/shopify";
import { ArrowRight } from "./icons";

// Posts to the live Shopify customer form so subscribers land in Shopify admin, same as the theme.
export function NewsletterForm() {
  const [done, setDone] = useState(false);
  if (done) return <p className="leading-6">Thanks for subscribing!</p>;
  return (
    <form
      action={`${SHOP_URL}/contact#newsletter`}
      method="post"
      target="_blank"
      onSubmit={() => setTimeout(() => setDone(true), 0)}
      className="flex h-[60px] items-center rounded-full border border-black/15 pl-7 pr-5"
    >
      <input type="hidden" name="form_type" value="customer" />
      <input type="hidden" name="contact[tags]" value="newsletter" />
      <label htmlFor="newsletter-email" className="sr-only">Email</label>
      <input id="newsletter-email" type="email" name="contact[email]" required placeholder="Email address" className="h-full flex-1 bg-transparent outline-none placeholder:text-black/50" />
      <button aria-label="Subscribe"><ArrowRight /></button>
    </form>
  );
}
