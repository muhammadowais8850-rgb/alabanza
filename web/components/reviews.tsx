"use client";

import { useEffect, useState } from "react";
import type { Review, ReviewSummary } from "@/lib/reviews";
import { ChevronLeft, ChevronRight } from "./icons";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

// Judge.me orange stars; partial fill for averages like 4.5.
export function Stars({ value, size = 17 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex text-[#e38800]" role="img" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} width={size + 4} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <clipPath id={`s${i}-${size}-${fill}`}><rect width={24 * fill} height="24" /></clipPath>
            </defs>
            <path d={STAR} fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d={STAR} fill="currentColor" clipPath={`url(#s${i}-${size}-${fill})`} />
          </svg>
        );
      })}
    </span>
  );
}

const VerifiedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Verified by Judge.me" className="inline-block">
    <rect width="16" height="16" rx="2" fill="#3fb7a6" />
    <path d="M3.5 8.2l3 3 6-6.5" stroke="#fff" strokeWidth="2" fill="none" />
  </svg>
);

function CarouselItem({ r }: { r: Review }) {
  return (
    <div className="flex w-full shrink-0 flex-col items-center justify-center gap-[6px] px-6 text-center md:w-1/3">
      <Stars value={r.score} />
      <p className="line-clamp-1 text-[14px] leading-[19.6px]">{r.body}</p>
      <p className="text-[12.6px] text-black/50">{r.author}</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- third-party review photo, tiny thumb */}
      {r.pic && <img src={r.pic} alt={`Photo from ${r.author}`} loading="lazy" className="mt-2 h-[92px] w-[92px] rounded-lg object-cover" />}
    </div>
  );
}

export function ReviewCarousel({ heading, data }: { heading: string; data: ReviewSummary }) {
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setPerView(mq.matches ? 3 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const pages = Math.max(1, Math.ceil(data.reviews.length / perView));
  const at = page % pages;
  return (
    <div>
      <h2 className="text-[32px] font-bold leading-none tracking-[-0.01em] md:text-[48px]">{heading}</h2>
      <div className="mt-1 flex flex-col items-center">
        <Stars value={data.rating} size={14} />
        <p className="flex items-center gap-2">from {data.count} reviews <VerifiedIcon /></p>
      </div>
      <div className="mt-6 overflow-hidden">
        <div className="flex items-center transition-transform duration-500" style={{ transform: `translateX(-${at * 100}%)`, minHeight: 170 }}>
          {data.reviews.map((r) => <CarouselItem key={r.id} r={r} />)}
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-[18px] text-black/15">
        <button aria-label="Previous reviews" onClick={() => setPage((at - 1 + pages) % pages)} className="hover:text-black/40"><ChevronLeft width={62} height={62} strokeWidth={0.8} /></button>
        <button aria-label="Next reviews" onClick={() => setPage((at + 1) % pages)} className="hover:text-black/40"><ChevronRight width={62} height={62} strokeWidth={0.8} /></button>
      </div>
    </div>
  );
}

export function ProductReviews({ data }: { data: ReviewSummary }) {
  const [shown, setShown] = useState(5);
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-16 md:px-10" aria-label="Customer reviews">
      <h2 className="mb-3 text-[24px] font-bold leading-6">Customer Reviews</h2>
      <div className="flex items-center gap-3 border-b border-black/10 pb-6">
        <Stars value={data.rating} />
        <span>{data.rating.toFixed(2)} out of 5 · Based on {data.count} {data.count === 1 ? "review" : "reviews"}</span>
      </div>
      <ul className="divide-y divide-black/10">
        {data.reviews.slice(0, shown).map((r) => (
          <li key={r.id} className="flex gap-4 py-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef1ea] font-bold">{r.author.charAt(0).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <Stars value={r.score} size={14} />
              <p className="mt-1 font-medium">{r.author}</p>
              <p className="mt-2 leading-[22.4px]">{r.body}</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- third-party review photo */}
              {r.pic && <img src={r.pic} alt={`Photo from ${r.author}`} loading="lazy" className="mt-3 h-[92px] w-[92px] rounded-lg object-cover" />}
            </div>
          </li>
        ))}
      </ul>
      {shown < data.reviews.length && (
        <button onClick={() => setShown(shown + 5)} className="mt-2 h-11 rounded-lg border border-black/15 px-6">Show more reviews</button>
      )}
    </section>
  );
}
