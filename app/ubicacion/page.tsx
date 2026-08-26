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
import { isWaLocationId } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Ubicaciones",
  description:
    "Visítanos en Mad Dogos Hotdogs. Sucursales en Antonio Rosales y La Primavera, Culiacán. Horario y mapa.",
};

export default function UbicacionPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 md:px-6 md:py-20">
            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-90">
              Visítanos
            </p>
            <h1 className="font-display max-w-3xl text-5xl leading-none tracking-wide uppercase md:text-6xl">
              Ubicaciones Mad Dogos
            </h1>
            <p className="max-w-2xl text-base opacity-95 md:text-lg">
              Dos sucursales en Culiacán, cada una con su horario. Si estamos cerrados,
              igual puedes programar tu pedido.
            </p>
            <ul className="flex max-w-2xl flex-col gap-4">
              {LOCATIONS.map((location) => (
                <li key={location.id} className="flex items-start gap-3">
                  <MapPin className="mt-1 size-5 shrink-0" />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{location.label}</p>
                      <LocationOpenStatusBadge
                        location={location}
                        size="sm"
                        showDetail={false}
                      />
                    </div>
                    <p className="opacity-90">{location.full}</p>
                  </div>
                </li>
              ))}
            </ul>
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
          <div className="divide-border divide-y">
            {LOCATIONS.map((location) => (
              <article
                key={location.id}
                className="grid gap-6 py-10 first:pt-0 last:pb-0 md:grid-cols-5 md:gap-10"
              >
                <div className="space-y-3 md:col-span-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-3xl tracking-wide uppercase">
                        {location.label}
                      </h2>
                      <LocationOpenStatusBadge
                        location={location}
                        size="sm"
                        showDetail={false}
                      />
                    </div>
                    <p className="text-muted-foreground flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      {location.full}
                    </p>
                  </div>
                  <div className="border-border bg-muted overflow-hidden rounded-2xl border shadow-sm">
                    <iframe
                      title={`Mapa Mad Dogos ${location.label}`}
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
                  {isWaLocationId(location.id) ? (
                    <OrderWhatsAppButton
                      source="ubicacion"
                      locationId={location.id}
                      className="w-full"
                    />
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
