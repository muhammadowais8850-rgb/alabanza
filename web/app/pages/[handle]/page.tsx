import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SHOP_URL, shopify } from "@/lib/shopify";

type Page = { title: string; body: string; seo: { title: string | null; description: string | null } };

const getPage = async (handle: string) =>
  (await shopify<{ page: Page | null }>(`query($h:String!){ page(handle:$h){ title body seo{title description} } }`, { h: handle })).page;

export async function generateMetadata({ params }: PageProps<"/pages/[handle]">): Promise<Metadata> {
  const p = await getPage((await params).handle);
  return p ? { title: p.seo.title ?? p.title, description: p.seo.description ?? undefined } : {};
}

const field = "h-12 w-full rounded-[4px] border border-black/15 px-[13px] outline-none focus:border-black";

export default async function ContentPage({ params }: PageProps<"/pages/[handle]">) {
  const { handle } = await params;
  const p = await getPage(handle);
  if (!p) notFound();
  return (
    <div className="mx-auto max-w-[800px] px-4 pb-16 pt-12">
      <h1 className="mb-8 text-[40px] font-bold leading-[1.1] md:text-[48px]">{p.title}</h1>
      <div className="rte text-[15px] leading-[1.7]" dangerouslySetInnerHTML={{ __html: p.body }} />
      {handle === "contact" && (
        // Posts to Shopify's contact endpoint so messages still reach the store inbox.
        <form action={`${SHOP_URL}/contact#contact_form`} method="post" className="mt-10 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="form_type" value="contact" />
          <input type="hidden" name="utf8" value="✓" />
          <input name="contact[name]" placeholder="Name" aria-label="Name" className={field} />
          <input name="contact[email]" type="email" required placeholder="Email *" aria-label="Email" className={field} />
          <input name="contact[phone]" type="tel" placeholder="Phone number" aria-label="Phone number" className={`${field} md:col-span-2`} />
          <textarea name="contact[body]" rows={5} placeholder="Comment" aria-label="Comment" className={`${field} h-auto py-3 md:col-span-2`} />
          <button className="h-[52px] rounded-lg bg-black font-medium text-white md:w-[200px]">Send</button>
        </form>
      )}
    </div>
  );
}
