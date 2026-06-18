import { Clock, MapPin, PartyPopper } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { EVENT_INCLUDES, EVENT_TYPES } from "@/lib/site-info";
import { buildGraciasUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Renta el carrito de Mad Dogos para tu evento en Culiacán. Bodas, XV años, fiestas y eventos corporativos.",
};

export default function EventosPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 md:px-6 md:py-24">
            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-90">
              Mad Dogos en tu celebración
            </p>
            <h1 className="font-display max-w-3xl text-5xl leading-none tracking-wide uppercase md:text-6xl">
              Mad Dogos para tu evento en Culiacán
            </h1>
            <p className="max-w-2xl text-base opacity-90 md:text-lg">
              Llevamos el carrito de Mad Dogos a bodas, XV años, fiestas y eventos
              corporativos. Tus invitados disfrutan hot dogs y más, recién hechos en el
              lugar.
            </p>
            <Link
              href={buildGraciasUrl({ source: "eventos" })}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-accent text-accent-foreground w-fit shadow-md hover:bg-accent-hover hover:shadow-lg",
              )}
            >
              Cotizar por WhatsApp
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            <div className="space-y-4">
              <h2 className="font-display text-3xl tracking-wide uppercase">
                ¿Qué incluye?
              </h2>
              <ul className="space-y-3">
                {EVENT_INCLUDES.map((item) => (
                  <li key={item} className="flex gap-3 text-sm md:text-base">
                    <PartyPopper className="text-primary mt-0.5 size-5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-3xl tracking-wide uppercase">
                Tipos de evento
              </h2>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map((type) => (
                  <span
                    key={type}
                    className="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                Cuéntanos fecha, número de invitados y lugar. Te respondemos por WhatsApp
                con opciones y precio.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-muted/50 border-y">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
            <h2 className="font-display mb-6 text-3xl tracking-wide uppercase">
              ¿Cómo funciona?
            </h2>
            <ol className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Escríbenos",
                  text: "Mándanos un WhatsApp con la fecha, lugar y cuántas personas esperas.",
                },
                {
                  step: "2",
                  title: "Cotizamos",
                  text: "Te proponemos menú y paquete según tu evento y presupuesto.",
                },
                {
                  step: "3",
                  title: "¡A disfrutar!",
                  text: "Llegamos con el carrito y servimos a tus invitados en el momento.",
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className="bg-card border-border rounded-xl border p-5 shadow-sm"
                >
                  <span className="bg-primary text-primary-foreground mb-3 inline-flex size-8 items-center justify-center rounded-full text-sm font-bold">
                    {item.step}
                  </span>
                  <h3 className="mb-2 font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6">
            <h2 className="font-display text-4xl tracking-wide uppercase">
              ¿Tienes un evento próximo?
            </h2>
            <Link
              href={buildGraciasUrl({ source: "eventos" })}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-accent text-accent-foreground shadow-md hover:bg-accent-hover hover:shadow-lg",
              )}
            >
              Cotizar por WhatsApp
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
