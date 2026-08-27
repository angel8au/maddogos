import { ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { LocationHoursCard } from "@/components/location-hours-card";
import { LocationOpenStatusBadge } from "@/components/open-status-badge";
import { OrderWhatsAppButton } from "@/components/order-whatsapp-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { LOCATIONS } from "@/lib/site-info";
import { cn } from "@/lib/utils";

const location = LOCATIONS[0];

export const metadata: Metadata = {
  title: "Ubicación",
  description:
    "Visítanos en Mad Dogos Hotdogs. Francisco Zarco 510-528, Antonio Rosales, Culiacán. Horario y mapa.",
  alternates: { canonical: "/ubicacion" },
  openGraph: {
    url: "/ubicacion",
    title: "Ubicación | Mad Dogos Hotdogs Culiacán",
    description:
      "Visítanos en Mad Dogos Hotdogs. Francisco Zarco 510-528, Antonio Rosales, Culiacán. Horario y mapa.",
  },
};

export default function UbicacionPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido-principal">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 md:px-6 md:py-20">
            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-90">
              Visítanos
            </p>
            <h1 className="font-display max-w-3xl text-5xl leading-none tracking-wide uppercase md:text-6xl">
              Ubicación Mad Dogos
            </h1>
            <div className="flex max-w-2xl flex-wrap items-center gap-3">
              <MapPin className="size-5 shrink-0" />
              <p className="text-base opacity-95 md:text-lg">{location.full}</p>
              <LocationOpenStatusBadge
                location={location}
                size="sm"
                showDetail={false}
              />
            </div>
            <p className="max-w-2xl text-base opacity-95 md:text-lg">
              Si estamos cerrados, igual puedes programar tu pedido por WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/menu"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-accent text-accent-foreground shadow-md hover:bg-accent-hover hover:shadow-lg",
                )}
              >
                Ver menú
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <article className="grid gap-6 md:grid-cols-5 md:gap-10">
            <div className="space-y-3 md:col-span-3">
              <div className="border-border bg-muted overflow-hidden rounded-2xl border shadow-sm">
                <iframe
                  title="Mapa Mad Dogos Culiacán"
                  src={location.mapsEmbedUrl}
                  className="aspect-[4/3] w-full min-h-[240px] border-0 md:aspect-video md:min-h-[320px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              >
                Abrir en Google Maps
                <ExternalLink className="size-3.5" />
              </a>
            </div>

            <div className="flex flex-col gap-4 md:col-span-2">
              <LocationHoursCard location={location} hideHeader />
              <OrderWhatsAppButton source="ubicacion" className="w-full" />
            </div>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
