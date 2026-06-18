import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MenuCard } from "@/components/menu-card";
import { MenuSection } from "@/components/menu-section";
import { buttonVariants } from "@/components/ui/button";
import { categoryOrder } from "@/lib/menu-data";
import { getMenuItems } from "@/lib/queries";
import { buildGraciasUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export default async function Home() {
  const menuItems = await getMenuItems();
  const featured = menuItems.filter((item) => item.featured).slice(0, 4);

  return (
    <>
      <SiteHeader />

      <main>
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 md:px-6 md:py-24">
            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-90">
              Culiacán, Sinaloa
            </p>
            <h1 className="font-display max-w-3xl text-5xl leading-none tracking-wide uppercase md:text-7xl">
              Hot dogs a domicilio en Culiacán
            </h1>
            <p className="max-w-xl text-base opacity-90 md:text-lg">
              Pide hot dogs, hamburguesas, alitas y boneless. Entrega rápida directo
              por WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={buildGraciasUrl(undefined, "hero")}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-accent text-accent-foreground hover:bg-accent/90",
                )}
              >
                Ordenar por WhatsApp
              </Link>
              <a
                href="#hot-dogs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10",
                )}
              >
                Ver menú
              </a>
            </div>
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
            <h2 className="font-display mb-6 text-3xl tracking-wide uppercase">
              Lo más pedido
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {featured.map((item) => (
                <MenuCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="bg-secondary/60 mx-auto mb-4 w-full max-w-6xl rounded-lg px-4 py-4 text-sm md:mx-6 md:max-w-[calc(72rem-3rem)] md:px-6">
          <strong>Alitas y Boneless</strong> incluyen vegetales y salsa a elegir: BBQ,
          Red Hot, Teriyaki, MadDogos Sauce o Mango Habanero.
        </section>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 md:px-6 md:py-12">
          {categoryOrder.map((category) => (
            <MenuSection
              key={category}
              category={category}
              items={menuItems.filter((item) => item.category === category)}
            />
          ))}
        </div>

        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6">
            <h2 className="font-display text-4xl tracking-wide uppercase">
              ¿Tienes hambre? Ordena ahora
            </h2>
            <Link
              href={buildGraciasUrl(undefined, "footer-cta")}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-accent text-accent-foreground hover:bg-accent/90",
              )}
            >
              Pedir por WhatsApp
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
