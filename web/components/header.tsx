"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SHOP_URL, type CardProduct, type MenuItem } from "@/lib/shopify";
import { CartCount, useCart } from "./cart";
import { AccountIcon, BagIcon, ChevronLeft, ChevronRight, CloseIcon, MenuIcon, SearchIcon } from "./icons";
import { Price } from "./price";

export function AnnouncementBar({ items }: { items: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length, i]);
  const go = (d: number) => setI((n) => (n + d + items.length) % items.length);
  return (
    <div className="border-b border-black/10 text-[13px] text-black">
      <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-4 md:px-10">
        <button aria-label="Previous announcement" onClick={() => go(-1)}><ChevronLeft width={16} height={16} /></button>
        <p className="truncate px-2">{items[i]}</p>
        <button aria-label="Next announcement" onClick={() => go(1)}><ChevronRight width={16} height={16} /></button>
      </div>
    </div>
  );
}

export function Header({ logo, menu, mega }: { logo: string; menu: MenuItem[]; mega: Record<string, CardProduct[]> }) {
  const { setOpen } = useCart();
  const pathname = usePathname();
  const [hover, setHover] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  // Close menus on navigation (state adjusted during render, not in an effect).
  const [path, setPath] = useState(pathname);
  if (path !== pathname) { setPath(pathname); setHover(null); setDrawer(false); setSearch(false); }

  const active = menu.find((m) => m.title === hover && m.items.length);
  const logoEl = (
    <Link href="/" aria-label="The Alabanza home" className="block">
      <Image src={logo} alt="The Alabanza" width={108} height={36} priority className="h-9 w-[108px]" />
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-white" onMouseLeave={() => setHover(null)}>
      <div className="mx-auto grid h-[60px] md:h-[66px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-10">
        <div className="flex items-center gap-4">
          <button className="md:hidden" aria-label="Menu" onClick={() => setDrawer(true)}><MenuIcon /></button>
          <button className="md:hidden" aria-label="Search" onClick={() => setSearch(true)}><SearchIcon /></button>
          <div className="hidden md:block">{logoEl}</div>
        </div>
        <div className="md:hidden">{logoEl}</div>
        <nav className="hidden md:block" aria-label="Main">
          <ul className="flex gap-5 text-[14px]">
            {menu.map((m) => (
              <li key={m.title} onMouseEnter={() => setHover(m.title)}>
                <Link href={m.url} className={`py-6 ${pathname === m.url || hover === m.title ? "text-black" : "text-black/70"} hover:text-black`}>{m.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center justify-end gap-5 md:gap-6">
          <button className="hidden md:block" aria-label="Search" onClick={() => setSearch(true)}><SearchIcon /></button>
          <a href={`${SHOP_URL}/account`} aria-label="Account"><AccountIcon /></a>
          <button aria-label="Cart" className="relative" onClick={() => setOpen(true)}><BagIcon /><CartCount /></button>
        </div>
      </div>

      {active && (
        <div className="absolute inset-x-0 top-full hidden border-b-4 border-black bg-white md:block">
          <div className="mx-auto flex max-w-[1440px] justify-between gap-10 px-10 pb-8 pt-1">
            <ul className="space-y-[7px] text-[16px]">
              {active.items.map((s) => (
                <li key={s.url}><Link href={s.url} className="hover:underline">{s.title}</Link></li>
              ))}
            </ul>
            <div className="grid w-[670px] grid-cols-3 gap-5">
              {(mega[active.title] ?? []).map((p) => (
                <Link key={p.id} href={`/products/${p.handle}`} className="block">
                  <div className="relative aspect-[210/263] bg-[#f5f5f5]">
                    {p.featuredImage && <Image src={p.featuredImage.url} alt={p.featuredImage.altText ?? p.title} fill sizes="210px" className="object-cover" />}
                  </div>
                  <p className="mt-2 text-[14px] leading-[18px]">{p.title}</p>
                  <Price p={p} compareFirst className="text-[14px]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {drawer && <MobileMenu menu={menu} close={() => setDrawer(false)} />}
      {search && <SearchOverlay close={() => setSearch(false)} />}
    </header>
  );
}

function MobileMenu({ menu, close }: { menu: MenuItem[]; close: () => void }) {
  const [sub, setSub] = useState<MenuItem | null>(null);
  const list = sub ? sub.items : menu;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div role="dialog" aria-label="Menu" className="absolute inset-y-0 left-0 w-[85%] max-w-[360px] overflow-y-auto bg-white p-5">
        <div className="mb-6 flex items-center justify-between">
          {sub ? <button onClick={() => setSub(null)} className="flex items-center gap-1"><ChevronLeft width={16} />{sub.title}</button> : <span />}
          <button aria-label="Close" onClick={close}><CloseIcon /></button>
        </div>
        <ul className="space-y-1 text-[28px] leading-[38.8px]">
          {sub && <li><Link href={sub.url} className="block py-1 text-[18px] underline">View all {sub.title}</Link></li>}
          {list.map((m) => (
            <li key={m.url} className="flex items-center justify-between">
              <Link href={m.url} className="block py-1">{m.title}</Link>
              {m.items.length > 0 && <button aria-label={`Open ${m.title}`} onClick={() => setSub(m)}><ChevronRight /></button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SearchOverlay({ close }: { close: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}
        className="relative mx-auto mt-0 flex max-w-[800px] items-center gap-3 bg-white px-5 py-4 md:mt-16 md:rounded-xl"
      >
        <SearchIcon />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search" className="h-10 flex-1 text-base outline-none" />
        <button type="button" aria-label="Close search" onClick={close}><CloseIcon /></button>
      </form>
    </div>
  );
}
