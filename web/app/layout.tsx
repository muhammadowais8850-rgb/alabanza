import type { Metadata } from "next";
import localFont from "next/font/local";
import { CartProvider } from "@/components/cart";
import { Footer, WhatsAppButton } from "@/components/footer";
import { AnnouncementBar, Header } from "@/components/header";
import { MetaPixel } from "@/components/meta-pixel";
import { getContent } from "@/lib/content";
import { getMenu, getProductsByHandles } from "@/lib/shopify";
import "./globals.css";

// Same Inter files (OFL) and weights the live theme serves; heavier weights render as 700 there too.
const inter = localFont({
  variable: "--font-inter",
  src: [
    { path: "./fonts/inter-400.woff2", weight: "400" },
    { path: "./fonts/inter-500.woff2", weight: "500" },
    { path: "./fonts/inter-700.woff2", weight: "700" },
  ],
});

export const metadata: Metadata = {
  title: { default: "The Alabanza", template: "%s – The Alabanza" },
  description: "Handpicked jewelry, watches and bags - crafted to help you celebrate the moments and the people that matter most.",
  // Carried over from the Shopify theme so Google Search Console stays verified.
  verification: { google: "o017AM0FSxM0nfWfQJ69vWb4bKfoXG6lwsuTY6rduDU" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const c = await getContent();
  const [menu, care, ...megaLists] = await Promise.all([
    getMenu("main-menu"),
    getMenu("footer"),
    ...Object.values(c.megaMenuProducts).map(getProductsByHandles),
  ]);
  const mega = Object.fromEntries(Object.keys(c.megaMenuProducts).map((k, i) => [k, megaLists[i]]));
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans">
        <CartProvider>
          <AnnouncementBar items={c.announcements} />
          <Header logo={c.logo} menu={menu} mega={mega} />
          <main>{children}</main>
          <Footer c={c} shop={menu} care={care} />
          <WhatsAppButton url={c.whatsappUrl} />
          <MetaPixel />
        </CartProvider>
      </body>
    </html>
  );
}
