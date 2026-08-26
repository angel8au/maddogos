import Link from "next/link";
import { SiteOpenStatusBadge } from "@/components/open-status-badge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PromotionsMenu } from "@/components/menu/promotions-menu";
import { MenuView } from "@/components/menu/menu-view";
import { Testimonios } from "@/components/testimonios";
import { buttonVariants } from "@/components/ui/button";
import { getMenuPageData } from "@/lib/queries";
import { GOOGLE_TESTIMONIALS_SUMMARY } from "@/lib/testimonials-data";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export default async function Home() {
  const { items: menuItems, sauceOptions } = await getMenuPageData();
  const promotions = menuItems
    .filter((item) => item.category === "promociones")
    .slice(0, 6);

  return (
    <>
      <SiteHeader />

      <main>
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 md:px-6 md:py-24">
            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-90">
              Culiacán, Sinaloa
            </p>
            <SiteOpenStatusBadge size="md" />
            <h1 className="font-display max-w-3xl text-5xl leading-none tracking-wide uppercase md:text-7xl">
              Hot dogs a domicilio en Culiacán
            </h1>
            <p className="max-w-xl text-base opacity-90 md:text-lg">
              Pide hot dogs, hamburguesas, alitas y boneless. Entrega rápida directo
              por WhatsApp.
            </p>
            <div className="flex flex-wrap items-start gap-3">
              <Link
                href="/menu"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-accent text-accent-foreground shadow-md hover:bg-accent-hover hover:shadow-lg active:bg-accent/95",
                )}
              >
                Ver menú y ordenar
              </Link>
            </div>
          </div>
        </section>

        {promotions.length > 0 ? (
          <section className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
            <h2 className="font-display mb-6 text-3xl tracking-wide uppercase">
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
            <h2 className="font-display text-3xl tracking-wide uppercase">Menú completo</h2>
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
            <h2 className="font-display text-4xl tracking-wide uppercase">
              ¿Tienes hambre? Ordena ahora
            </h2>
            <Link
              href="/menu"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-accent text-accent-foreground shadow-md hover:bg-accent-hover hover:shadow-lg active:bg-accent/95",
              )}
            >
              Arma tu pedido
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter className="mt-0" />
    </>
  );
}
