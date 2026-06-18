import type { MenuCategory, MenuExtra, MenuItem } from "@/lib/types";

export const DEFAULT_SAUCE_OPTIONS = [
  "BBQ",
  "Red Hot",
  "Teriyaki",
  "MadDogos Sauce",
  "Mango Habanero",
] as const;

/** Extras vinculables por categoría (IDs del seed/fallback) */
export const LINKED_EXTRA_IDS: Record<string, string[]> = {
  alitas: ["extra-gratinado", "extra-ranch", "extra-bbq", "extra-papas"],
  boneless: ["extra-gratinado", "extra-ranch", "extra-bbq", "extra-papas"],
  hamburguesas: [
    "extra-guacamole",
    "extra-animal",
    "extra-ranch",
    "extra-aro",
    "extra-papas",
  ],
  "hot-dogs": ["extra-chile", "extra-guacamole", "extra-ranch"],
  papas: ["extra-gratinado", "extra-animal", "extra-ranch"],
};

export function requiresDetailBeforeAdd(item: MenuItem): boolean {
  return requiresSauceSelection(item);
}

export function requiresSauceSelection(item: MenuItem): boolean {
  return (
    item.category === "alitas" ||
    item.category === "boneless" ||
    item.sauceRequired === true ||
    item.customizationType === "sauce"
  );
}

export function resolveLinkedExtras(
  item: MenuItem,
  allItems: MenuItem[],
): MenuExtra[] {
  if (item.linkedExtras?.length) return item.linkedExtras;

  const extraIds = LINKED_EXTRA_IDS[item.category];
  if (!extraIds?.length) return [];

  const extrasCatalog = allItems.filter((i) => i.category === "extras");
  return extraIds
    .map((id) => extrasCatalog.find((e) => e._id === id || e._id === `menuItem.${id}`))
    .filter((e): e is MenuItem => Boolean(e))
    .map((e) => ({ _id: e._id, name: e.name, price: e.price }));
}

export function customizationTypeForFallback(
  category: MenuCategory,
  name: string,
): MenuItem["customizationType"] {
  if (category === "hamburguesas") return "ingredients";
  if (category === "hot-dogs" && name !== "Easy Dog") return "ingredients";
  if (category === "alitas" || category === "boneless") return "sauce";
  return "none";
}

export function sauceRequiredForFallback(category: MenuCategory): boolean {
  return category === "alitas" || category === "boneless";
}
