"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { track } from "@/lib/analytics";
import type { WhatsAppConversionType } from "@/lib/analytics-events";
import type { OrderFulfillment } from "@/lib/whatsapp";

type TrackedCtaLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  ctaLabel: string;
  ctaLocation: string;
  children: ReactNode;
  onClick?: () => void;
};

export function TrackedCtaLink({
  ctaLabel,
  ctaLocation,
  href,
  children,
  onClick,
  ...props
}: TrackedCtaLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => {
        track({
          event: "cta_click",
          cta_label: ctaLabel,
          cta_destination: typeof href === "string" ? href : href.pathname ?? "",
          cta_location: ctaLocation,
        });
        onClick?.();
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

type TrackedWhatsAppLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  source: string;
  type?: WhatsAppConversionType;
  fulfillment?: OrderFulfillment;
  cartValue?: number;
  cartItems?: number;
  productName?: string;
  ctaLocation?: string;
  children: ReactNode;
};

export function TrackedWhatsAppLink({
  source,
  type = "general",
  fulfillment,
  cartValue,
  cartItems,
  productName,
  ctaLocation,
  children,
  ...props
}: TrackedWhatsAppLinkProps) {
  return (
    <Link
      {...props}
      onClick={() =>
        track({
          event: "whatsapp_click",
          source,
          type,
          fulfillment,
          cart_value: cartValue,
          cart_items: cartItems,
          product_name: productName,
          cta_location: ctaLocation,
        })
      }
    >
      {children}
    </Link>
  );
}

type TrackedOutboundLinkProps = ComponentProps<"a"> & {
  linkText: string;
};

export function TrackedOutboundLink({
  linkText,
  href,
  children,
  onClick,
  ...props
}: TrackedOutboundLinkProps) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (href) {
          track({
            event: "outbound_click",
            link_url: href,
            link_text: linkText,
          });
        }
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

type RentalInquiryLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  ctaLocation: "hero" | "footer";
  children: ReactNode;
};

export function RentalInquiryLink({
  ctaLocation,
  children,
  href,
  ...props
}: RentalInquiryLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => {
        track({
          event: "rental_inquiry_click",
          source: "eventos",
          cta_location: ctaLocation,
        });
        track({
          event: "whatsapp_click",
          source: "eventos",
          type: "rental",
          cta_location: ctaLocation,
        });
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
