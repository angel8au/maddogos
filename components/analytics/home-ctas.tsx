"use client";

import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeCtaButtonProps = {
  href: string;
  label: string;
  location: string;
  className?: string;
};

export function HomeCtaButton({ href, label, location, className }: HomeCtaButtonProps) {
  return (
    <TrackedCtaLink
      href={href}
      ctaLabel={label}
      ctaLocation={location}
      className={className}
    >
      {label}
    </TrackedCtaLink>
  );
}

export function HomeHeroCta() {
  return (
    <HomeCtaButton
      href="/menu"
      label="Ver menú y ordenar"
      location="home-hero"
      className={cn(
        buttonVariants({ size: "lg" }),
        "bg-accent text-accent-foreground shadow-md hover:bg-accent-hover hover:shadow-lg active:bg-accent/95",
      )}
    />
  );
}

export function HomeFinalCta() {
  return (
    <HomeCtaButton
      href="/menu"
      label="Arma tu pedido"
      location="home-final"
      className={cn(
        buttonVariants({ size: "lg" }),
        "bg-accent text-accent-foreground shadow-md hover:bg-accent-hover hover:shadow-lg active:bg-accent/95",
      )}
    />
  );
}
