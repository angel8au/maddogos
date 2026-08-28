"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CART_ORDER_STORAGE_KEY, clearCartStorage } from "@/lib/cart-utils";
import { track, trackRentalInquiryLegacy } from "@/lib/analytics";
import type { WhatsAppConversionType } from "@/lib/analytics-events";
import {
  buildEventInquiryMessage,
  getWhatsAppHref,
  isMobileDevice,
  openWhatsApp,
  parseStoredCartOrder,
  type StoredCartOrder,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

function resolveMessage(
  item: string | undefined,
  source: string | undefined,
  storedOrder: StoredCartOrder | null,
): string | undefined {
  if (storedOrder) return storedOrder.message;
  if (source === "eventos") return buildEventInquiryMessage();
  if (item) return `Hola, quiero pedir: ${item}`;
  return undefined;
}

function resolveConversionType(
  source: string | undefined,
  item: string | undefined,
  storedOrder: StoredCartOrder | null,
): WhatsAppConversionType {
  if (source === "eventos") return "rental";
  if (storedOrder || source === "cart") return "order";
  if (item) return "single";
  return "general";
}

export function GraciasRedirect() {
  const searchParams = useSearchParams();
  const [storedOrder] = useState<StoredCartOrder | null>(() => {
    if (typeof window === "undefined") return null;
    return parseStoredCartOrder(sessionStorage.getItem(CART_ORDER_STORAGE_KEY));
  });
  const [opened, setOpened] = useState(false);
  const conversionTrackedRef = useRef(false);
  const redirectTrackedRef = useRef(false);

  const item = searchParams.get("item") ?? undefined;
  const source = searchParams.get("src") ?? undefined;
  const conversionType = resolveConversionType(source, item, storedOrder);

  const message = resolveMessage(item, source, storedOrder);
  const whatsappHref = getWhatsAppHref(message);

  useEffect(() => {
    if (conversionTrackedRef.current) return;
    conversionTrackedRef.current = true;

    track({
      event: "conversion_page_view",
      source: source ?? "direct",
      type: conversionType,
      fulfillment: storedOrder?.fulfillment,
      product_name: item,
    });

    if (source === "eventos") {
      trackRentalInquiryLegacy();
    }
  }, [conversionType, item, source, storedOrder?.fulfillment]);

  const trackWhatsAppRedirect = (autoOpen: boolean) => {
    if (redirectTrackedRef.current) return;
    redirectTrackedRef.current = true;

    track({
      event: "whatsapp_redirect",
      source: source ?? "direct",
      type: conversionType,
      fulfillment: storedOrder?.fulfillment,
      product_name: item,
    });

    track({
      event: "whatsapp_open",
      source: source ?? "direct",
      type: conversionType,
      auto_open: autoOpen,
      fulfillment: storedOrder?.fulfillment,
    });
  };

  useEffect(() => {
    // Auto-open only on Android — iOS/PWA require an explicit tap.
    if (isMobileDevice() && !/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      const timer = window.setTimeout(() => {
        trackWhatsAppRedirect(true);
        openWhatsApp(message);
      }, 300);
      return () => window.clearTimeout(timer);
    }
  }, [message]);

  const handleOpenWhatsApp = () => {
    trackWhatsAppRedirect(false);

    if (storedOrder) {
      sessionStorage.removeItem(CART_ORDER_STORAGE_KEY);
      clearCartStorage();
    }
    setOpened(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="font-display text-primary text-4xl uppercase">¡Listo!</p>
        <p className="text-muted-foreground max-w-sm text-sm">
          {opened
            ? "Si WhatsApp no se abrió, toca el botón de abajo."
            : "Toca el botón para enviar tu pedido por WhatsApp."}
        </p>
      </div>

      <a
        href={whatsappHref}
        onClick={handleOpenWhatsApp}
        className={cn(buttonVariants({ size: "lg" }), "min-w-[240px] text-base")}
      >
        Enviar por WhatsApp
      </a>

      <p className="text-muted-foreground max-w-xs text-xs">
        Funciona sin internet si tu plan incluye WhatsApp ilimitado.
      </p>
    </main>
  );
}
