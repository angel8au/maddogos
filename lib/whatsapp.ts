import type { CartLineItem } from "@/lib/types";
import {
  cartTotal,
  formatExtrasForDisplay,
  formatIngredientsForDisplay,
  lineSubtotal,
  lineUnitPrice,
} from "@/lib/cart-utils";

export function formatMXN(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WA_NUMBER ?? "526673872070";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

export function buildWhatsAppUrl(message?: string): string {
  const number = getWhatsAppNumber();
  const text = message ?? "Hola, quiero hacer un pedido";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildEventInquiryMessage(): string {
  return "Hola, me interesa contratar a Mad Dogos para un evento. ¿Me pueden dar información y cotización?";
}

export function buildOrderMessage(lines: CartLineItem[]): string {
  if (!lines.length) return "Hola, quiero hacer un pedido";

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

  return [
    "Hola, quiero hacer el siguiente pedido:",
    "",
    items,
    "",
    `Total: ${formatMXN(cartTotal(lines))}`,
  ].join("\n");
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
