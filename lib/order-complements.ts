import type { OrderComplement } from "@/lib/types";

/** Condimentos opcionales a nivel de pedido (opt-in; default = no mandar). */
export const ORDER_COMPLEMENTS: OrderComplement[] = [
  { id: "champinon", name: "Champiñón" },
  { id: "jalapeno", name: "Jalapeño" },
  { id: "pepinillo", name: "Pepinillo" },
  { id: "catsup", name: "Catsup" },
  { id: "mostaza", name: "Mostaza" },
];

export function formatComplementsForDisplay(selectedIds: string[]): string {
  if (!selectedIds.length) {
    return "Ninguno (solo cubiertos y servilletas)";
  }

  const names = ORDER_COMPLEMENTS.filter((c) => selectedIds.includes(c.id)).map(
    (c) => c.name,
  );

  return names.length ? names.join(", ") : "Ninguno (solo cubiertos y servilletas)";
}

export function resolveComplementNames(selectedIds: string[]): string[] {
  return ORDER_COMPLEMENTS.filter((c) => selectedIds.includes(c.id)).map(
    (c) => c.name,
  );
}
