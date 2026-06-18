"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { CART_ORDER_STORAGE_KEY, clearCartStorage } from "@/lib/cart-utils";
import { buildEventInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export function GraciasRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const item = searchParams.get("item") ?? undefined;
    const source = searchParams.get("src") ?? undefined;
    const storedOrder = sessionStorage.getItem(CART_ORDER_STORAGE_KEY);

    let message: string | undefined;
    if (storedOrder) {
      message = storedOrder;
    } else if (source === "eventos") {
      message = buildEventInquiryMessage();
    } else if (item) {
      message = `Hola, quiero pedir: ${item}`;
    }

    if (source === "eventos") {
      posthog.capture("rental_inquiry");
      posthog.capture("whatsapp_redirect", { source: "eventos", type: "rental" });
    } else if (source === "cart" || storedOrder) {
      posthog.capture("whatsapp_redirect", { source: source ?? "cart", type: "order" });
    } else if (item) {
      posthog.capture("whatsapp_redirect", { name: item, source, type: "single" });
    }

    const url = buildWhatsAppUrl(message);

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
