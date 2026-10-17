import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingView } from "@/components/listing-view";
import { getCollectionListing, SORTS } from "@/lib/listing";

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const c = await getCollectionListing(handle, {});
  return { title: c?.title, description: c?.description || undefined };
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[handle]">) {
  const [{ handle }, sp] = await Promise.all([params, searchParams]);
  const c = await getCollectionListing(handle, sp);
  if (!c) notFound();
  const sort = String(sp.sort_by ?? "manual");
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 md:px-10">
      <h1 className="pb-16 pt-12 text-[40px] font-bold leading-none md:text-[56px] md:leading-[48px]">{c.title}</h1>
      {c.descriptionHtml && <div className="rte -mt-6 mb-8 max-w-[700px]" dangerouslySetInnerHTML={{ __html: c.descriptionHtml }} />}
      <Suspense>
        <ListingView filters={c.filters} products={c.products} sorts={Object.entries(SORTS).map(([k, [label]]) => [k, label])} sort={sort} />
      </Suspense>
    </div>
  );
}
