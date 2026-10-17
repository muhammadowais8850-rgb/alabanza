"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Image as Img } from "@/lib/shopify";

// Desktop: two-column stack of every image (as the theme). Mobile: swipeable carousel with dots.
export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onVariant = (e: Event) => {
      const i = images.findIndex((img) => img.url === (e as CustomEvent<string>).detail);
      const el = track.current;
      if (i >= 0 && el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    };
    window.addEventListener("variant-image", onVariant);
    return () => window.removeEventListener("variant-image", onVariant);
  }, [images]);

  return (
    <>
      <div className="hidden grid-cols-2 gap-[3px] md:grid">
        {images.map((img, i) => (
          <div key={img.url} className="relative aspect-square bg-[#f5f5f5]">
            <Image src={img.url} alt={img.altText ?? title} fill priority={i < 2} sizes="31vw" className="object-cover" />
          </div>
        ))}
      </div>
      <div className="relative -mx-4 md:hidden">
        <div
          ref={track}
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((img, i) => (
            <div key={img.url} className="relative aspect-square w-full shrink-0 snap-center">
              <Image src={img.url} alt={img.altText ?? title} fill priority={i === 0} sizes="(min-width: 768px) 1px, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-[10px]">
            {images.map((img, i) => (
              <span key={img.url} className={`h-2 w-2 rounded-full border border-white ${i === index ? "bg-[#2a6db5]" : "bg-black/40"}`} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
