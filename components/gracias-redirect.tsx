"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { buttonVariants } from "@/components/ui/button";
import { CART_ORDER_STORAGE_KEY, clearCartStorage } from "@/lib/cart-utils";
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

export function GraciasRedirect() {
  const searchParams = useSearchParams();
  const [storedOrder, setStoredOrder] = useState<StoredCartOrder | null>(null);
  const [opened, setOpened] = useState(false);

  const item = searchParams.get("item") ?? undefined;
  const source = searchParams.get("src") ?? undefined;

  useEffect(() => {
    setStoredOrder(
      parseStoredCartOrder(sessionStorage.getItem(CART_ORDER_STORAGE_KEY)),
    );
  }, []);

  const message = resolveMessage(item, source, storedOrder);
  const whatsappHref = getWhatsAppHref(message);

  useEffect(() => {
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

    // Auto-open only on Android — iOS/PWA require an explicit tap.
    if (isMobileDevice() && !/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      const timer = window.setTimeout(() => openWhatsApp(message), 300);
      return () => window.clearTimeout(timer);
    }
  }, [item, message, source, storedOrder]);

  const handleOpenWhatsApp = () => {
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
