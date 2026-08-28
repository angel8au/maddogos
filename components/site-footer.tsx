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
    <footer className={cn("mt-16 bg-black text-white", className)}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <SiteLogo size="footer" />
            <p className="text-sm text-white/80">Hot dogs estilo Sinaloa en Culiacán</p>
            <p className="max-w-sm text-xs text-white/60">{BUSINESS_ADDRESS.full}</p>
            <p className="text-xs text-white/60">{OPENING_HOURS_SUMMARY}</p>
          </div>
          <div className="flex flex-col gap-4">
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/80 transition-opacity hover:text-white"
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
                className="text-white/80 transition-opacity hover:text-white"
              >
                Instagram
              </TrackedOutboundLink>
              <TrackedOutboundLink
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                linkText="Facebook"
                className="text-white/80 transition-opacity hover:text-white"
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
                "w-fit bg-white text-black hover:bg-white/90",
              )}
            >
              Ordenar por WhatsApp
            </TrackedWhatsAppLink>
          </div>
        </div>
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} Mad Dogos Hotdogs
        </p>
      </div>
    </footer>
  );
}
