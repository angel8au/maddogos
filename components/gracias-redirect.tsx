"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { CART_ORDER_STORAGE_KEY, clearCartStorage } from "@/lib/cart-utils";
import {
  buildEventInquiryMessage,
  buildWhatsAppUrl,
  isMobileDevice,
  openWhatsApp,
  parseStoredCartOrder,
} from "@/lib/whatsapp";

export function GraciasRedirect() {
  const searchParams = useSearchParams();
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    const item = searchParams.get("item") ?? undefined;
    const source = searchParams.get("src") ?? undefined;
    const storedOrder = parseStoredCartOrder(
      sessionStorage.getItem(CART_ORDER_STORAGE_KEY),
    );

    let message: string | undefined;

    if (storedOrder) {
      message = storedOrder.message;
    } else if (source === "eventos") {
      message = buildEventInquiryMessage();
    } else if (item) {
      message = `Hola, quiero pedir: ${item}`;
    }

    if (source === "eventos") {
      posthog.capture("rental_inquiry");
      posthog.capture("whatsapp_redirect", { source: "eventos", type: "rental" });
    } else if (source === "cart" || storedOrder) {
      posthog.capture("whatsapp_redirect", {
        source: source ?? "cart",
        type: "order",
        fulfillment: storedOrder?.fulfillment,
      });
    } else if (item) {
      posthog.capture("whatsapp_redirect", {
        name: item,
        source,
        type: "single",
      });
    } else {
      posthog.capture("whatsapp_redirect", {
        source: source ?? "direct",
        type: "general",
      });
    }

    const redirectTimer = window.setTimeout(() => {
      if (storedOrder) {
        sessionStorage.removeItem(CART_ORDER_STORAGE_KEY);
        clearCartStorage();
      }
      openWhatsApp(message);
    }, 200);

    let fallbackTimer: number | undefined;
    if (isMobileDevice()) {
      fallbackTimer = window.setTimeout(() => {
        setFallbackUrl(buildWhatsAppUrl(message));
      }, 2500);
    }

    return () => {
      window.clearTimeout(redirectTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-primary text-4xl uppercase">¡Gracias!</p>
      <p className="text-muted-foreground">Te estamos redirigiendo a WhatsApp...</p>
      <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      {fallbackUrl ? (
        <div className="mt-4 space-y-2">
          <p className="text-muted-foreground text-sm">¿No se abrió WhatsApp?</p>
          <a
            href={fallbackUrl}
            className="text-primary text-sm font-medium underline underline-offset-4"
          >
            Toca aquí para abrir WhatsApp
          </a>
        </div>
      ) : null}
    </main>
  );
}
