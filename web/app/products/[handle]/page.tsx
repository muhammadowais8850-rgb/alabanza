import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Gallery } from "@/components/gallery";
import { PlusIcon, TrustIcon } from "@/components/icons";
import { ProductReviews } from "@/components/reviews";
import { ProductCard } from "@/components/product-card";
import { ProductForm, type Option, type Variant } from "@/components/product-form";
import { SaleTimer } from "@/components/sale-timer";
import { getContent } from "@/lib/content";
import { personalizationFor } from "@/lib/personalization";
import { getProductReviews } from "@/lib/reviews";
import { CARD, shopify, type CardProduct, type Image } from "@/lib/shopify";

type Product = {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  images: { nodes: Image[] };
  options: Option[];
  variants: { nodes: Variant[] };
  seo: { title: string | null; description: string | null };
};

async function getProduct(handle: string) {
  const d = await shopify<{ product: Product | null }>(
    `query($h:String!){ product(handle:$h){ id title description descriptionHtml seo{title description}
      images(first:30){ nodes{ url altText width height } }
      options{ name optionValues{ name swatch{ color } } }
      variants(first:100){ nodes{ id title availableForSale selectedOptions{name value} price{amount currencyCode} compareAtPrice{amount currencyCode} image{url} } } } }`,
    { h: handle },
  );
  return d.product;
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const p = await getProduct((await params).handle);
  if (!p) return {};
  return {
    title: p.seo.title ?? p.title,
    description: p.seo.description ?? p.description.slice(0, 160),
    openGraph: { images: p.images.nodes.slice(0, 1).map((i) => i.url) },
  };
}

const ICONS = [["truck", "Fast Delivery"], ["box", "Cash on Delivery"], ["returns", "Easy Returns"]];

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const [p, c] = await Promise.all([getProduct(handle), getContent()]);
  if (!p) notFound();
  // Like the theme, the selected (first available) variant's image leads the gallery.
  const lead = (p.variants.nodes.find((v) => v.availableForSale) ?? p.variants.nodes[0])?.image?.url;
  const images = [...p.images.nodes].sort((a, b) => Number(b.url === lead) - Number(a.url === lead));
  const [recs, reviews] = await Promise.all([
    shopify<{ productRecommendations: CardProduct[] | null }>(
      `${CARD} query($id:ID!){ productRecommendations(productId:$id){ ...Card } }`,
      { id: p.id },
    ),
    getProductReviews(handle),
  ]);

  return (
    <>
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 md:grid-cols-[883fr_429fr] md:gap-12 md:px-10">
        <Gallery images={images} title={p.title} />
        <div className="md:sticky md:top-[66px] md:self-start md:pb-10 md:pt-[25px]">
          <Suspense>
            <ProductForm productId={p.id} title={p.title} options={p.options} variants={p.variants.nodes} personalization={personalizationFor(handle)} />
          </Suspense>
          <div className="mt-5 space-y-5">
            <SaleTimer anchor={c.pdp.timerAnchor} hours={c.pdp.timerHours} />
            <p className="rounded-lg bg-[#eef1ea] px-4 py-[13px] text-center font-bold leading-[22px] text-black">
              {c.pdp.offer[0]}
              <br />
              {c.pdp.offer[1]}
            </p>
            <div className="rte text-[14px] leading-[22.4px]" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
            <ul className="grid grid-cols-3 items-center gap-2 py-4">
              {ICONS.map(([icon, label]) => (
                <li key={label} className="flex items-center gap-2"><TrustIcon name={icon} />{label}</li>
              ))}
            </ul>
            <div className="border-t border-black/10">
              {c.pdp.accordions.map(([icon, title, text]) => (
                <details key={title} className="group border-b border-black/10">
                  <summary className="flex cursor-pointer list-none items-center gap-2 py-3 text-[12.6px] font-medium [&::-webkit-details-marker]:hidden">
                    <TrustIcon name={icon} />
                    {title}
                    <PlusIcon className="ml-auto transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="pb-4">{text}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {reviews && reviews.count > 0 && <ProductReviews data={reviews} />}

      {!!recs.productRecommendations?.length && (
        <section className="mx-auto max-w-[1440px] px-4 pb-12 pt-16 md:px-10">
          <h3 className="mb-[30px] text-[24px] font-bold leading-6">You may also like</h3>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
            {recs.productRecommendations.slice(0, 4).map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </>
  );
}
