import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MenuView } from "@/components/menu/menu-view";
import { getMenuPageData } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menú",
  description:
    "Menú completo de Mad Dogos: hot dogs, hamburguesas, alitas, boneless, conos, charolas y más en Culiacán.",
};

export default async function MenuPage() {
  const { items, sauceOptions } = await getMenuPageData();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 md:px-6">
        <h1 className="font-display mb-6 text-4xl tracking-wide uppercase md:text-5xl">
          Menú Mad Dogos
        </h1>
        <MenuView items={items} sauceOptions={sauceOptions} />
      </main>
      <SiteFooter />
    </>
  );
}
