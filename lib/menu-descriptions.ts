import type { MenuCategory } from "@/lib/types";

export const PAPAS_ACCOMPANIMENT_TEXT =
  "Acompañado con papas 100% naturales, cortadas de la papa fresca y preparadas al momento.";

/** Productos que no llevan papas de acompañamiento */
const NO_PAPAS_ACCOMPANIMENT_IDS = new Set([
  "lowcarb-burguer",
  "lowcarb-double",
  "combo-2-bacon",
  "combo-2-chilli",
  "combo-bacon-chilli",
  "combo-3-easy",
  "alitas-boneless-pieza",
  "combo-dr",
  "sampler-madburguer",
  "sampler-maddogos",
]);

const SKIP_CATEGORIES = new Set<MenuCategory>(["extras", "bebidas", "papas"]);

function itemIdKey(id: string): string {
  return id.replace(/^menuItem\./, "");
}

function alreadyHasPapasQualityText(description: string): boolean {
  return description.includes("100% naturales");
}

/** Añade el texto de papas naturales a descripciones de productos que las incluyen. */
export function enhanceMenuDescription(
  itemId: string,
  category: MenuCategory,
  description: string,
): string {
  const id = itemIdKey(itemId);
  const trimmed = description.trim();
  if (!trimmed) return trimmed;
  if (alreadyHasPapasQualityText(trimmed)) return trimmed;
  if (SKIP_CATEGORIES.has(category)) return trimmed;
  if (NO_PAPAS_ACCOMPANIMENT_IDS.has(id)) return trimmed;

  return `${trimmed.replace(/[.!?]$/, "")}. ${PAPAS_ACCOMPANIMENT_TEXT}`;
}
