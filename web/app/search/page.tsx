import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingView } from "@/components/listing-view";
import { getSearchListing } from "@/lib/listing";

export const metadata: Metadata = { title: "Search" };

const SEARCH_SORTS: [string, string][] = [["relevance", "Relevance"], ["price-ascending", "Price, low to high"], ["price-descending", "Price, high to low"]];

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  const r = q ? await getSearchListing(q, sp) : null;
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 md:px-10">
      <h1 className="pb-8 pt-[46px] text-[40px] font-bold leading-none md:text-[56px]">{q ? `Results for “${q}”` : "Search"}</h1>
      <form action="/search" className="mb-10 flex max-w-[600px] items-center rounded-full border border-black/15 px-5">
        <input name="q" defaultValue={q} placeholder="Search" aria-label="Search" className="h-12 flex-1 bg-transparent outline-none" />
        <button className="font-medium">Search</button>
      </form>
      {r && (
        <Suspense>
          <ListingView filters={r.filters} products={r.products} sorts={SEARCH_SORTS} sort={String(sp.sort_by ?? "relevance")} />
        </Suspense>
      )}
    </div>
  );
}
