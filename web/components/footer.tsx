import Link from "next/link";
import type { Content } from "@/lib/content";
import type { MenuItem } from "@/lib/shopify";
import { NewsletterForm } from "./newsletter";
import { SocialIcon, TrustIcon, WhatsAppIcon } from "./icons";

const H = ({ children }: { children: React.ReactNode }) => (
  <h6 className="mb-4 text-[12px] font-bold uppercase tracking-[1.68px] text-gold">{children}</h6>
);

export function Footer({ c, shop, care }: { c: Content; shop: MenuItem[]; care: MenuItem[] }) {
  const f = c.footer;
  return (
    <footer className="text-[14px] text-[#2b2b2b]">
      <section className="bg-[#f5f5f5]">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 pb-[39px] pt-10 text-center sm:grid-cols-2 md:grid-cols-4 md:px-10">
          {c.trust.map(([icon, title, text]) => (
            <li key={title} className="flex flex-col items-center gap-2 px-4">
              <TrustIcon name={icon} width={28} height={28} className="text-gold" />
              <h3 className="mt-1 text-[12px] font-bold uppercase tracking-[1.68px] text-gold">{title}</h3>
              <p className="leading-6">{text}</p>
            </li>
          ))}
        </ul>
      </section>
      <div className="mx-auto max-w-[1440px] px-4 md:px-10">
        <div className="grid gap-10 border-t border-gold/30 py-10 md:grid-cols-[446fr_258fr_305fr_351fr] md:gap-0 md:pb-3">
          <div>
            <H>The Alabanza</H>
            <p className="max-w-[400px] leading-6">{f.about}</p>
            <p className="mt-4 leading-6">{f.address.map((l) => <span key={l} className="block">{l}</span>)}
              Customer Service: {f.phone}<br />WhatsApp: {f.whatsapp}<br />
              <a href={`mailto:${f.email}`}>{f.email}</a></p>
          </div>
          <nav aria-label="Shop"><H>Shop</H><ul className="space-y-[10px]">{shop.map((m) => <li key={m.url}><Link href={m.url}>{m.title}</Link></li>)}</ul></nav>
          <nav aria-label="Customer care"><H>Customer Care</H><ul className="space-y-[10px]">{care.map((m) => <li key={m.url}><Link href={m.url}>{m.title}</Link></li>)}</ul></nav>
          <div>
            <H>Stay In Loop</H>
            <p className="mb-4 leading-6">Subscribe for <strong className="text-gold">exclusive discounts</strong>, early access to new arrivals and flash sales - straight to your inbox.</p>
            <NewsletterForm />
          </div>
        </div>
        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-black/10 py-[29px] text-[12px] text-black/55 md:flex-row">
          <p>© {new Date().getFullYear()}, <Link href="/">The Alabanza</Link> Powered by AZ Care Services</p>
          <ul className="flex gap-4 text-[#2b2b2b]">
            {Object.entries(f.social).map(([name, url]) => (
              <li key={name}><a href={url} target="_blank" rel="noreferrer" aria-label={name}><SocialIcon name={name} /></a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg">
      <WhatsAppIcon />
    </a>
  );
}
