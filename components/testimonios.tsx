"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import type { TestimonialsSummary } from "@/lib/testimonials-data";
import { GOOGLE_MAPS_URL } from "@/lib/site-info";
import { cn } from "@/lib/utils";

type TestimoniosProps = {
  data: TestimonialsSummary;
  className?: string;
};

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < Math.round(rating)
              ? "fill-accent text-accent"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  author,
  rating,
  text,
  relativeTime,
}: TestimonialsSummary["reviews"][number]) {
  return (
    <figure className="bg-card border-border flex w-[300px] shrink-0 flex-col rounded-xl border p-4 shadow-sm md:w-[340px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Stars rating={rating} />
        {relativeTime ? (
          <span className="text-muted-foreground text-xs">{relativeTime}</span>
        ) : null}
      </div>
      <blockquote className="text-foreground mb-4 flex-1 text-sm leading-relaxed">
        &ldquo;{text}&rdquo;
      </blockquote>
      <figcaption className="text-sm font-semibold">{author}</figcaption>
      <p className="text-muted-foreground mt-1 text-xs">Google Maps</p>
    </figure>
  );
}

export function Testimonios({ data, className }: TestimoniosProps) {
  const [paused, setPaused] = useState(false);
  const marqueeItems = [...data.reviews, ...data.reviews, ...data.reviews];

  if (!data.reviews.length) return null;

  return (
    <section className={cn("space-y-6", className)} aria-label="Testimonios de clientes">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-end md:justify-between md:px-6">
        <div className="space-y-2">
          <h2 className="font-display text-3xl tracking-wide uppercase md:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Stars rating={data.rating} />
            <p className="text-sm font-medium">
              {data.rating.toFixed(1)} en Google
              {data.reviewCount ? (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · {data.reviewCount}+ opiniones
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <Link
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary shrink-0 text-sm font-medium hover:underline"
        >
          Ver todas en Google Maps →
        </Link>
      </div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r to-transparent md:w-20" />
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l to-transparent md:w-20" />

        <div
          className={cn(
            "testimonios-marquee flex w-max gap-4 px-4 md:px-6",
            paused && "[animation-play-state:paused]",
          )}
        >
          {marqueeItems.map((review, index) => (
            <TestimonialCard key={`${review.id}-${index}`} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
}
