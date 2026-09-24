"use client";

import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import {
  TrackedOutboundLink,
  TrackedWhatsAppLink,
} from "@/components/analytics/tracked-cta-link";
import { buttonVariants } from "@/components/ui/button";
import {
  BUSINESS_ADDRESS,
  OPENING_HOURS_SUMMARY,
  SOCIAL_LINKS,
} from "@/lib/site-info";
import { buildGraciasUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: "/menu", label: "Menú" },
  { href: "/eventos", label: "Eventos" },
  { href: "/ubicacion", label: "Ubicación" },
] as const;

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("bg-foreground text-background mt-16", className)}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <SiteLogo size="footer" />
            <p className="text-background/80 text-sm">Hot dogs estilo Sinaloa en Culiacán</p>
            <p className="text-background/60 max-w-sm text-xs">{BUSINESS_ADDRESS.full}</p>
            <p className="text-background/60 text-xs">{OPENING_HOURS_SUMMARY}</p>
          </div>
          <div className="flex flex-col gap-4">
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-background/80 hover:text-background transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <TrackedOutboundLink
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                linkText="Instagram"
                className="text-background/80 hover:text-background transition-opacity"
              >
                Instagram
              </TrackedOutboundLink>
              <TrackedOutboundLink
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                linkText="Facebook"
                className="text-background/80 hover:text-background transition-opacity"
              >
                Facebook
              </TrackedOutboundLink>
            </div>
            <TrackedWhatsAppLink
              href={buildGraciasUrl({ source: "footer" })}
              source="footer"
              type="general"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "bg-background text-foreground hover:bg-background/90 w-fit",
              )}
            >
              Ordenar por WhatsApp
            </TrackedWhatsAppLink>
          </div>
        </div>
        <p className="text-background/50 text-xs">
          © {new Date().getFullYear()} Mad Dogos Hotdogs
        </p>
      </div>
    </footer>
  );
}
