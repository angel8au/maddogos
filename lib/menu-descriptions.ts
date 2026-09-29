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

/** Alitas y boneless no traen papas de acompañamiento. */
const NO_SIDE_PAPAS_CATEGORIES = new Set<MenuCategory>(["alitas", "boneless"]);

function itemIdKey(id: string): string {
  return id.replace(/^menuItem\./, "");
}

function alreadyHasPapasQualityText(description: string): boolean {
  return description.includes("100% naturales");
}

/** El platillo incluye papas de acompañamiento (no es una orden de papas ni un extra). */
export function itemIncludesPapas(item: {
  _id: string;
  category: MenuCategory;
  badge?: string;
}): boolean {
  if (item.badge === "Sin papas") return false;
  if (SKIP_CATEGORIES.has(item.category)) return false;
  if (NO_SIDE_PAPAS_CATEGORIES.has(item.category)) return false;
  if (NO_PAPAS_ACCOMPANIMENT_IDS.has(itemIdKey(item._id))) return false;
  return true;
}

function withoutPapasAccompaniment(description: string): string {
  const sentence = PAPAS_ACCOMPANIMENT_TEXT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return description.replace(new RegExp(`\\s*${sentence}`, "g"), "").trim();
}

/** Añade el texto de papas naturales a descripciones de productos que las incluyen. */
export function enhanceMenuDescription(
  itemId: string,
  category: MenuCategory,
  description: string,
  badge?: string,
): string {
  const trimmed = description.trim();
  if (!trimmed) return trimmed;
  if (!itemIncludesPapas({ _id: itemId, category, badge })) {
    return withoutPapasAccompaniment(trimmed);
  }
  if (alreadyHasPapasQualityText(trimmed)) return trimmed;

  return `${trimmed.replace(/[.!?]$/, "")}. ${PAPAS_ACCOMPANIMENT_TEXT}`;
}
