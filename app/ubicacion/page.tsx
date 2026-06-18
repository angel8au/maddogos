import { Clock, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  BUSINESS_ADDRESS,
  GOOGLE_MAPS_EMBED_URL,
  GOOGLE_MAPS_URL,
  OPENING_HOURS,
} from "@/lib/site-info";
import { buildGraciasUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ubicación",
  description:
    "Visítanos en Mad Dogos Hotdogs. Francisco Zarco 510-528, Antonio Rosales, Culiacán. Horario y mapa.",
};

export default function UbicacionPage() {
  const todayIndex = new Date().getDay();
  const dayIndexMap = [6, 0, 1, 2, 3, 4, 5];
  const todayHoursIndex = dayIndexMap[todayIndex];
  const todayHours = OPENING_HOURS[todayHoursIndex];

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
              Ubicación Mad Dogos
            </h1>
            <div className="flex max-w-2xl items-start gap-3 text-base opacity-95 md:text-lg">
              <MapPin className="mt-1 size-5 shrink-0" />
              <p>{BUSINESS_ADDRESS.full}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-accent text-accent-foreground shadow-md hover:bg-accent-hover hover:shadow-lg",
                )}
              >
                Abrir en Google Maps
              </a>
              <Link
                href="/menu"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "border border-primary-foreground/40 bg-transparent text-primary-foreground hover:border-accent/70 hover:bg-primary-foreground/15",
                )}
              >
                Ver menú
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="lg:col-span-3">
              <div className="border-border bg-muted overflow-hidden rounded-2xl border shadow-sm">
                <iframe
                  title="Mapa Mad Dogos Culiacán"
                  src={GOOGLE_MAPS_EMBED_URL}
                  className="aspect-[4/3] w-full min-h-[280px] border-0 md:aspect-video md:min-h-[360px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary mt-3 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              >
                Ver en Google Maps
                <ExternalLink className="size-3.5" />
              </a>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div>
                <h2 className="font-display mb-4 text-3xl tracking-wide uppercase">
                  Horario
                </h2>
                {todayHours ? (
                  <p
                    className={cn(
                      "mb-4 rounded-lg px-4 py-3 text-sm font-medium",
                      todayHours.closed
                        ? "bg-muted text-muted-foreground"
                        : "bg-accent/20 text-foreground",
                    )}
                  >
                    <Clock className="mr-2 inline size-4 align-text-bottom" />
                    Hoy ({todayHours.day}): {todayHours.hours}
                  </p>
                ) : null}
                <ul className="divide-y rounded-xl border">
                  {OPENING_HOURS.map((row) => (
                    <li
                      key={row.day}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <span className="font-medium">{row.day}</span>
                      <span
                        className={cn(
                          row.closed ? "text-muted-foreground" : "text-foreground",
                        )}
                      >
                        {row.hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-secondary/60 rounded-xl px-4 py-4 text-sm">
                <p className="font-semibold">¿Vas a pasar a recoger?</p>
                <p className="text-muted-foreground mt-1">
                  También puedes pedir a domicilio por WhatsApp desde nuestra página de
                  menú.
                </p>
                <Link
                  href={buildGraciasUrl({ source: "ubicacion" })}
                  className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full sm:w-auto")}
                >
                  Pedir por WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
