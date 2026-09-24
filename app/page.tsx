import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HomeFinalCta, HomeHeroCta } from "@/components/analytics/home-ctas";
import { SiteOpenStatusBadge } from "@/components/open-status-badge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PromotionsMenu } from "@/components/menu/promotions-menu";
import { MenuView } from "@/components/menu/menu-view";
import { Testimonios } from "@/components/testimonios";
import { getMenuPageData } from "@/lib/queries";
import { GOOGLE_TESTIMONIALS_SUMMARY } from "@/lib/testimonials-data";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Mad Dogos | Hot Dogs y Hamburguesas a Domicilio en Culiacán",
    description:
      "Pide tus hot dogs, hamburguesas, alitas y boneless a domicilio en Culiacán. Mad Dogos Hotdogs — entrega rápida directo por WhatsApp.",
  },
};

export default async function Home() {
  const { items: menuItems, sauceOptions } = await getMenuPageData();
  const promotions = menuItems
    .filter((item) => item.category === "promociones")
    .slice(0, 6);

  return (
    <>
      <SiteHeader />

      <main id="contenido-principal">
        <section className="bg-muted overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-4 pt-6 pb-12 md:grid-cols-[1.45fr_1fr] md:gap-8 md:px-6 md:py-16">
            <div className="order-2 flex flex-col gap-5 md:order-1">
              <SiteOpenStatusBadge size="md" />
              <h1 className="font-display text-4xl leading-[1.12] tracking-tight md:text-5xl lg:text-[3.5rem]">
                Hamburguesas y hotdogs a domicilio en Culiacán
              </h1>
              <p className="text-muted-foreground max-w-md text-base md:text-lg">
                Pide hot dogs, hamburguesas, alitas y boneless. Entrega rápida
                directo por WhatsApp.
              </p>
              <div className="flex flex-wrap items-start gap-3">
                <HomeHeroCta />
              </div>
            </div>

            <div className="relative order-1 mx-auto aspect-square w-full max-w-md md:order-2 md:max-w-none">
              <Image
                src="/images/hero-burger.jpg"
                alt="Hamburguesa Mad Dogos con queso, jamón, tocino y cebolla asada"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>
        </section>

        {promotions.length > 0 ? (
          <section className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
            <h2 className="font-display mb-6 text-3xl tracking-tight">
              Promociones
            </h2>
            <PromotionsMenu
              items={promotions}
              allItems={menuItems}
              sauceOptions={sauceOptions}
            />
          </section>
        ) : null}

        <section className="bg-secondary/60 mx-auto mb-4 w-full max-w-6xl rounded-lg px-4 py-4 text-sm md:px-6">
          <strong>Alitas y Boneless</strong> incluyen vegetales y salsa a elegir: BBQ,
          Red Hot, Teriyaki, MadDogos Sauce o Mango Habanero.
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-8 pb-28 md:px-6 md:py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl tracking-tight">Menú completo</h2>
            <Link href="/menu" className="text-primary text-sm font-medium hover:underline">
              Ver todo →
            </Link>
          </div>
          <MenuView items={menuItems} sauceOptions={sauceOptions} />
        </section>

        <section className="border-border border-t py-12 md:py-16">
          <Testimonios data={GOOGLE_TESTIMONIALS_SUMMARY} />
        </section>

        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6">
            <h2 className="font-display text-4xl tracking-tight">
              ¿Tienes hambre? Ordena ahora
            </h2>
            <HomeFinalCta />
          </div>
        </section>
      </main>

      <SiteFooter className="mt-0" />
    </>
  );
}
