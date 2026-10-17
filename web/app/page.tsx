import Image from "next/image";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { ReviewCarousel } from "@/components/reviews";
import { ProductCard } from "@/components/product-card";
import { Spotlight, type SpotVariant } from "@/components/spotlight";
import { getContent } from "@/lib/content";
import { getShopReviews } from "@/lib/reviews";
import { getCollectionProducts, shopify, type CardProduct } from "@/lib/shopify";

export default async function Home() {
  const c = await getContent();
  const [lists, spot, reviews] = await Promise.all([
    Promise.all(c.productLists.map((l) => getCollectionProducts(l.collection, 8))),
    shopify<{ product: { title: string; featuredImage: SpotVariant["image"]; variants: { nodes: SpotVariant[] } } | null }>(
      `query($h:String!){ product(handle:$h){ title featuredImage{url altText} variants(first:10){ nodes{ id title image{url altText} price{amount currencyCode} compareAtPrice{amount currencyCode} } } } }`,
      { h: c.spotlight.product },
    ),
    getShopReviews(),
  ]);

  return (
    <>
      <section className="relative h-[315px] md:h-[362px]">
        <Image src={c.hero.image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-center gap-6 px-4 md:gap-[25px] md:pb-9 md:px-10">
          <h1 className="max-w-[300px] text-[36px] font-bold leading-none text-white md:max-w-none md:text-[48px]">{c.hero.heading}</h1>
          <Link href={c.hero.link} className="flex h-[54px] w-[125px] items-center justify-center rounded-lg border border-white text-white md:w-[286px]">{c.hero.button}</Link>
        </div>
      </section>

      {c.productLists.map((l, i) => (
        <ProductList key={l.title} first={i === 0} title={l.title} collection={l.collection} products={lists[i]} carousel={l.layout === "carousel"} />
      ))}

      {spot.product && (
        <Spotlight handle={c.spotlight.product} title={spot.product.title} lifestyle={c.spotlight.image} image={spot.product.featuredImage} variants={spot.product.variants.nodes} />
      )}

      {reviews && reviews.count > 0 && (
        <section className="mx-auto max-w-[864px] px-4 pb-6 pt-7 text-center md:px-0">
          <ReviewCarousel heading={c.reviewsHeading} data={reviews} />
        </section>
      )}

      <Faq heading={c.faqHeading} items={c.faq} />
    </>
  );
}

function ProductList({ first, title, collection, products, carousel }: { first: boolean; title: string; collection: string; products: CardProduct[]; carousel: boolean }) {
  return (
    <section className={`mx-auto max-w-[1440px] px-4 md:px-10 ${first ? "pb-[50px] pt-[10px]" : "pb-[35px] pt-12"}`}>
      <div className="mb-[30px] flex items-end justify-between">
        <h2 className="text-[24px] font-bold leading-6">{title}</h2>
        <Link href={`/collections/${collection}`} className="text-[14px]">View all</Link>
      </div>
      {carousel ? (
        <div className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 md:-mx-10 md:scroll-px-10 md:px-10">
          {products.map((p) => (
            <div key={p.id} className="w-[45%] shrink-0 snap-start md:w-[316px]"><ProductCard p={p} sizes="316px" /></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-[5px] gap-y-3 md:gap-y-6 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}
