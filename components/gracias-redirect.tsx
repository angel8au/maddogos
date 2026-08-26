"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { CART_ORDER_STORAGE_KEY, clearCartStorage } from "@/lib/cart-utils";
import {
  buildEventInquiryMessage,
  buildWhatsAppUrl,
  isWaLocationId,
  locationLabel,
  parseStoredCartOrder,
} from "@/lib/whatsapp";
import { getLocationOpenStatus } from "@/lib/opening-status";
import { LOCATIONS } from "@/lib/site-info";

export function GraciasRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const item = searchParams.get("item") ?? undefined;
    const source = searchParams.get("src") ?? undefined;
    const locParam = searchParams.get("loc");
    const storedOrder = parseStoredCartOrder(
      sessionStorage.getItem(CART_ORDER_STORAGE_KEY),
    );

    let message: string | undefined;
    let locationId = isWaLocationId(locParam) ? locParam : undefined;

    if (storedOrder) {
      message = storedOrder.message;
      locationId = storedOrder.locationId;
    } else if (source === "eventos") {
      message = buildEventInquiryMessage();
    } else if (item) {
      message = `Hola, quiero pedir: ${item}`;
    } else if (locationId) {
      const location = LOCATIONS.find((entry) => entry.id === locationId);
      const status = location ? getLocationOpenStatus(location) : null;
      if (status?.isScheduled) {
        message = `Hola, quiero programar un pedido en ${locationLabel(locationId)} (${status.detailEs})`;
      } else {
        message = `Hola, quiero hacer un pedido en ${locationLabel(locationId)}`;
      }
    }

    if (source === "eventos") {
      posthog.capture("rental_inquiry");
      posthog.capture("whatsapp_redirect", { source: "eventos", type: "rental" });
    } else if (source === "cart" || storedOrder) {
      posthog.capture("whatsapp_redirect", {
        source: source ?? "cart",
        type: "order",
        location: locationId,
        fulfillment: storedOrder?.fulfillment,
      });
    } else if (item) {
      posthog.capture("whatsapp_redirect", {
        name: item,
        source,
        type: "single",
        location: locationId,
      });
    } else {
      posthog.capture("whatsapp_redirect", {
        source: source ?? "direct",
        type: "general",
        location: locationId,
      });
    }

    const url = buildWhatsAppUrl(message, locationId);

    const timer = window.setTimeout(() => {
      if (storedOrder) {
        sessionStorage.removeItem(CART_ORDER_STORAGE_KEY);
        clearCartStorage();
      }
      window.location.replace(url);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-primary text-4xl uppercase">¡Gracias!</p>
      <p className="text-muted-foreground">Te estamos redirigiendo a WhatsApp...</p>
      <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
    </main>
  );
}
