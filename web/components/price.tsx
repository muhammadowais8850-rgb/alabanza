import { formatMoney, type CardProduct } from "@/lib/shopify";

export const onSale = (p: CardProduct) =>
  Number(p.compareAtPriceRange.minVariantPrice.amount) > Number(p.priceRange.minVariantPrice.amount);

// Badge uses the cheapest compare price (as the theme does); the shown prices come from the first available variant.
export function Price({ p, compareFirst, className = "" }: { p: CardProduct; compareFirst?: boolean; className?: string }) {
  const v = p.selectedOrFirstAvailableVariant ?? { price: p.priceRange.minVariantPrice, compareAtPrice: p.compareAtPriceRange.minVariantPrice };
  const price = <span>{formatMoney(v.price)}</span>;
  const compare = v.compareAtPrice && Number(v.compareAtPrice.amount) > Number(v.price.amount) && <s className="text-black/40">{formatMoney(v.compareAtPrice)}</s>;
  return <div className={`flex flex-wrap gap-1 ${className}`}>{compareFirst ? <>{compare}{price}</> : <>{price}{compare}</>}</div>;
}
