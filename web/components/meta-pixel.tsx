"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

// Same pixel the Shopify "Facebook & Instagram" app uses; checkout (InitiateCheckout/Purchase) is still tracked by Shopify.
const ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Fbq = (...args: unknown[]) => void;
const fbq = (...args: unknown[]) => (window as unknown as { fbq?: Fbq }).fbq?.(...args);

// Content IDs in the format the Shopify Facebook catalog uses, so ads can match products.
export const contentId = (productGid: string, variantGid: string) =>
  `shopify_PK_${productGid.split("/").pop()}_${variantGid.split("/").pop()}`;

export const track = (event: "ViewContent" | "AddToCart", params: Record<string, unknown>) => fbq("track", event, params);

export function MetaPixel() {
  const pathname = usePathname();
  useEffect(() => {
    if (ID) fbq("track", "PageView");
  }, [pathname]);
  if (!ID) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(ID)});fbq('track','PageView');`}
    </Script>
  );
}
