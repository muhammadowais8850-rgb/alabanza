"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Filter } from "@/lib/listing";
import type { CardProduct } from "@/lib/shopify";
import { ChevronDown } from "./icons";
import { ProductCard } from "./product-card";

const Dropdown = ({ label, children, right }: { label: React.ReactNode; children: React.ReactNode; right?: boolean }) => (
  <details className="group relative">
    <summary className="flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden">
      {label} <ChevronDown className="transition-transform group-open:rotate-180" />
    </summary>
    <div className={`absolute top-full z-20 mt-2 min-w-[220px] rounded-lg border border-black/10 bg-white p-4 shadow-lg ${right ? "right-0" : "left-0"}`}>{children}</div>
  </details>
);

const GridIcon = ({ dense }: { dense?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    {dense
      ? [2, 8, 14].flatMap((x) => [2, 8, 14].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.2" />))
      : [1.5, 9.5].flatMap((x) => [1.5, 9.5].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="5" height="5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />))}
  </svg>
);

export function ListingView({ filters, products, sorts, sort }: { filters: Filter[]; products: CardProduct[]; sorts: [string, string][]; sort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [dense, setDense] = useState(false);
  const picked = sp.getAll("filter");

  const push = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mut(p);
    router.push(`${pathname}?${p}`, { scroll: false });
  };
  const toggle = (id: string) => push((p) => {
    const rest = p.getAll("filter").filter((x) => x !== id);
    p.delete("filter");
    (picked.includes(id) ? rest : [...rest, id]).forEach((x) => p.append("filter", x));
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-[14px]">
        <div className="flex flex-wrap items-center gap-5">
          {filters.map((f) =>
            f.type === "PRICE_RANGE" ? (
              <Dropdown key={f.id} label={f.label}>
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    push((p) => { for (const k of ["min", "max"]) { if (fd.get(k)) p.set(k, String(fd.get(k))); else p.delete(k); } });
                  }}
                >
                  <input name="min" type="number" min={0} defaultValue={sp.get("min") ?? ""} placeholder="From" aria-label="Minimum price" className="w-20 rounded border border-black/15 px-2 py-1" />
                  <span>–</span>
                  <input name="max" type="number" min={0} defaultValue={sp.get("max") ?? ""} placeholder={String(JSON.parse(f.values[0]?.input ?? "{}").price?.max ?? "To")} aria-label="Maximum price" className="w-20 rounded border border-black/15 px-2 py-1" />
                  <button className="rounded bg-black px-3 py-1 text-white">Go</button>
                </form>
              </Dropdown>
            ) : (
              <Dropdown key={f.id} label={f.label}>
                <ul className="space-y-2">
                  {f.values.map((v) => (
                    <li key={v.id}>
                      <label className={`flex cursor-pointer items-center gap-2 ${v.count === 0 && !picked.includes(v.id) ? "opacity-40" : ""}`}>
                        <input type="checkbox" checked={picked.includes(v.id)} disabled={v.count === 0 && !picked.includes(v.id)} onChange={() => toggle(v.id)} />
                        {v.label} <span className="text-black/50">({v.count})</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </Dropdown>
            ),
          )}
          {(picked.length > 0 || sp.get("min") || sp.get("max")) && (
            <button className="underline" onClick={() => push((p) => { p.delete("filter"); p.delete("min"); p.delete("max"); })}>Clear all</button>
          )}
        </div>
        <div className="flex items-center gap-5">
          <span className="text-black/55">{products.length} {products.length === 1 ? "item" : "items"}</span>
          <Dropdown label="Sort" right>
            <ul className="space-y-2 whitespace-nowrap">
              {sorts.map(([value, label]) => (
                <li key={value}>
                  <button className={value === sort ? "font-bold" : ""} onClick={() => push((p) => p.set("sort_by", value))}>{label}</button>
                </li>
              ))}
            </ul>
          </Dropdown>
          <div className="hidden gap-1 md:flex">
            <button aria-label="Large grid" aria-pressed={!dense} onClick={() => setDense(false)} className={`rounded p-[6px] ${dense ? "" : "bg-black/5"}`}><GridIcon /></button>
            <button aria-label="Small grid" aria-pressed={dense} onClick={() => setDense(true)} className={`rounded p-[6px] text-black/50 ${dense ? "bg-black/5" : ""}`}><GridIcon dense /></button>
          </div>
        </div>
      </div>
      {products.length ? (
        <div className={`grid grid-cols-2 gap-x-4 gap-y-6 ${dense ? "md:grid-cols-8" : "md:grid-cols-5"}`}>
          {products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 5} sizes={dense ? "12vw" : "(min-width: 768px) 20vw, 50vw"} />)}
        </div>
      ) : (
        <p className="py-20 text-center">No products found. <button className="underline" onClick={() => push((p) => { p.delete("filter"); p.delete("min"); p.delete("max"); })}>Clear filters</button></p>
      )}
    </>
  );
}
