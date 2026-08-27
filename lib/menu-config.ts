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

export type ItemCustomizationRules = {
  /** 0 = no salsa, 1 = una salsa, 2 = alitas + boneless */
  sauceCount: number;
  sauceLabels?: string[];
  /** Bebidas incluidas en el precio (obligatorias antes de agregar) */
  includedDrinkCount: number;
  /** Si se define, solo estas bebidas (IDs sin prefijo menuItem.) se pueden elegir */
  includedDrinkIds?: string[];
  /** Debe elegir 1 hamburguesa del menú (incluida en el combo) */
  requiresBurgerChoice?: boolean;
};

/**
 * Reglas por ID de producto (sin prefijo menuItem.).
 * Combos/promos/charolas con alitas/boneless y/o bebidas incluidas.
 */
export const ITEM_CUSTOMIZATION_RULES: Record<string, ItemCustomizationRules> = {
  "combo-dr": { sauceCount: 1, includedDrinkCount: 1 },
  "combo-dr-alitas": { sauceCount: 1, includedDrinkCount: 0 },
  "combo-dr-boneless": { sauceCount: 1, includedDrinkCount: 0 },
  "alitas-boneless-pieza": { sauceCount: 1, includedDrinkCount: 0 },
  "sampler-madburguer": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 0,
  },
  "charola-burguer": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 2,
    includedDrinkIds: ["bebida-jazmin", "bebida-jamaica"],
  },
  "charola-dogos": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 2,
    includedDrinkIds: ["bebida-jazmin", "bebida-jamaica"],
  },
  "charola-especial": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 2,
    includedDrinkIds: ["bebida-jazmin", "bebida-jamaica"],
    requiresBurgerChoice: true,
  },
};

export function menuItemIdKey(id: string): string {
  return id.replace(/^menuItem\./, "");
}

export function getCustomizationRules(
  item: Pick<
    MenuItem,
    "_id" | "category" | "sauceRequired" | "customizationType" | "includedDrinkCount"
  >,
): ItemCustomizationRules {
  const fromTable = ITEM_CUSTOMIZATION_RULES[menuItemIdKey(item._id)];
  if (fromTable) return fromTable;

  const needsSauce =
    item.category === "alitas" ||
    item.category === "boneless" ||
    item.sauceRequired === true ||
    item.customizationType === "sauce";

  return {
    sauceCount: needsSauce ? 1 : 0,
    includedDrinkCount: item.includedDrinkCount ?? 0,
  };
}

export function requiresDetailBeforeAdd(item: MenuItem): boolean {
  const rules = getCustomizationRules(item);
  return (
    rules.sauceCount > 0 ||
    rules.includedDrinkCount > 0 ||
    Boolean(rules.requiresBurgerChoice)
  );
}

export function requiresSauceSelection(item: MenuItem): boolean {
  return getCustomizationRules(item).sauceCount > 0;
}

export function requiresDrinkSelection(item: MenuItem): boolean {
  return getCustomizationRules(item).includedDrinkCount > 0;
}

export function requiresBurgerSelection(item: MenuItem): boolean {
  return Boolean(getCustomizationRules(item).requiresBurgerChoice);
}

export function burgersForChoice(allItems: MenuItem[]): MenuItem[] {
  return allItems.filter((i) => i.category === "hamburguesas");
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
  id?: string,
): MenuItem["customizationType"] {
  if (id && (ITEM_CUSTOMIZATION_RULES[menuItemIdKey(id)]?.sauceCount ?? 0) > 0) {
    return "sauce";
  }
  if (category === "hamburguesas") return "ingredients";
  if (category === "hot-dogs" && name !== "Easy Dog") return "ingredients";
  if (category === "alitas" || category === "boneless") return "sauce";
  return "none";
}

export function sauceRequiredForFallback(
  category: MenuCategory,
  id?: string,
): boolean {
  if (id && (ITEM_CUSTOMIZATION_RULES[menuItemIdKey(id)]?.sauceCount ?? 0) > 0) {
    return true;
  }
  return category === "alitas" || category === "boneless";
}

export function includedDrinkCountForFallback(id: string): number {
  return ITEM_CUSTOMIZATION_RULES[menuItemIdKey(id)]?.includedDrinkCount ?? 0;
}

/** Filtra bebidas disponibles según reglas del producto (ej. charolas: Té y Jamaica). */
export function filterIncludedDrinks(
  item: Pick<MenuItem, "_id">,
  drinks: MenuItem[],
): MenuItem[] {
  const allowed =
    ITEM_CUSTOMIZATION_RULES[menuItemIdKey(item._id)]?.includedDrinkIds;

  const withoutHielo = drinks.filter(
    (d) => !d._id.includes("bebida-hielo") && d.slug !== "vaso-con-hielo",
  );

  if (!allowed?.length) return withoutHielo;

  const allowedSet = new Set(allowed);
  return withoutHielo.filter((d) => allowedSet.has(menuItemIdKey(d._id)));
}
