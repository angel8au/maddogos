import type { CartLineItem } from "@/lib/types";
import {
  cartTotal,
  formatExtrasForDisplay,
  formatIngredientsForDisplay,
  lineSubtotal,
  lineUnitPrice,
} from "@/lib/cart-utils";

export type OrderFulfillment = "pickup" | "delivery";

export type StoredCartOrder = {
  message: string;
  fulfillment: OrderFulfillment;
};

const DEFAULT_WA_NUMBER = "526673872070";

export function formatMXN(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

export function getWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WA_NUMBER ?? DEFAULT_WA_NUMBER;
  return normalizeWhatsAppNumber(raw);
}

export function buildWhatsAppUrl(message?: string): string {
  const number = getWhatsAppNumber();
  const text = message ?? "Hola, quiero hacer un pedido";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildEventInquiryMessage(): string {
  return "Hola, me interesa contratar a Mad Dogos para un evento. ¿Me pueden dar información y cotización?";
}

export function fulfillmentLabel(fulfillment: OrderFulfillment): string {
  return fulfillment === "delivery" ? "A domicilio" : "Para recoger";
}

export function buildOrderMessage(
  lines: CartLineItem[],
  options: {
    fulfillment: OrderFulfillment;
    scheduled?: boolean;
    scheduleNote?: string;
  },
): string {
  if (!lines.length) {
    return options.scheduled
      ? "Hola, quiero programar un pedido"
      : "Hola, quiero hacer un pedido";
  }

  const items = lines
    .map((line) => {
      const parts = [
        `• ${line.quantity}x ${line.name} — ${formatMXN(lineSubtotal(line))}`,
      ];
      if (line.selectedSauce) parts.push(`  Salsa: ${line.selectedSauce}`);
      const ing = formatIngredientsForDisplay(line.selectedIngredients);
      if (ing) parts.push(`  ${ing}`);
      const extras = formatExtrasForDisplay(line.selectedExtras);
      if (extras) parts.push(`  Extra: ${extras}`);
      if (line.specialInstructions?.trim()) {
        parts.push(`  Nota: ${line.specialInstructions.trim()}`);
      }
      return parts.join("\n");
    })
    .join("\n");

  const linesOut = [
    options.scheduled
      ? "Hola, quiero PROGRAMAR el siguiente pedido:"
      : "Hola, quiero hacer el siguiente pedido:",
    "",
    `Modalidad: ${fulfillmentLabel(options.fulfillment)}`,
  ];

  if (options.scheduled) {
    linesOut.push(
      `Tipo: Pedido programado${options.scheduleNote ? ` (${options.scheduleNote})` : ""}`,
    );
  }

  if (options.fulfillment === "delivery") {
    linesOut.push(
      "Nota: el costo del servicio de entrega depende de la distancia; por favor confirmen el monto.",
    );
  }

  linesOut.push("", items, "", `Total: ${formatMXN(cartTotal(lines))}`);

  return linesOut.join("\n");
}

export function parseStoredCartOrder(raw: string | null): StoredCartOrder | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredCartOrder & { locationId?: string }>;
    if (
      typeof parsed.message === "string" &&
      (parsed.fulfillment === "pickup" || parsed.fulfillment === "delivery")
    ) {
      return {
        message: parsed.message,
        fulfillment: parsed.fulfillment,
      };
    }
  } catch {
    if (raw.startsWith("Hola")) {
      return {
        message: raw,
        fulfillment: "pickup",
      };
    }
  }

  return null;
}

export function buildGraciasUrl(
  itemOrOptions?: string | { item?: string; source?: string },
  source?: string,
): string {
  const params = new URLSearchParams();

  if (typeof itemOrOptions === "object" && itemOrOptions !== null) {
    if (itemOrOptions.item) params.set("item", itemOrOptions.item);
    if (itemOrOptions.source) params.set("src", itemOrOptions.source);
  } else {
    if (itemOrOptions) params.set("item", itemOrOptions);
    if (source) params.set("src", source);
  }

  const query = params.toString();
  return query ? `/gracias?${query}` : "/gracias";
}

export { lineUnitPrice, lineSubtotal };
