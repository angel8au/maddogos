import type { MenuCategory, MenuExtra, MenuItem } from "@/lib/types";

export const DEFAULT_SAUCE_OPTIONS = [
  "BBQ",
  "Red Hot",
  "Teriyaki",
  "MadDogos Sauce",
  "Mango Habanero",
  "Natural",
] as const;

/** Hot dogs por defecto (Combo DR, Sampler, etc.): Easy Dog / Easy Dog Especial */
export const DOG_CHOICE_IDS = ["easy-dog", "easy-dog-especial"] as const;

/** Charola MadCombo Dogos: 4 opciones */
export const CHAROLA_DOG_CHOICE_IDS = [
  "easy-dog",
  "easy-dog-especial",
  "chilli-dog",
  "perro-bacon",
] as const;

/** Bebidas incluidas típicas en charolas / Combo DR */
export const INCLUDED_DRINK_TE_JAMAICA = ["bebida-jazmin", "bebida-jamaica"] as const;

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
  /** Debe elegir un hot dog incluido (lista según dogChoiceIds) */
  requiresDogChoice?: boolean;
  /** IDs de hot dogs elegibles; default = DOG_CHOICE_IDS */
  dogChoiceIds?: readonly string[];
};

/**
 * Reglas por ID de producto (sin prefijo menuItem.).
 * Combos/promos/charolas con alitas/boneless y/o bebidas incluidas.
 */
export const ITEM_CUSTOMIZATION_RULES: Record<string, ItemCustomizationRules> = {
  "combo-dr": {
    sauceCount: 1,
    includedDrinkCount: 1,
    includedDrinkIds: [...INCLUDED_DRINK_TE_JAMAICA],
    requiresDogChoice: true,
  },
  "combo-dr-alitas": {
    sauceCount: 1,
    includedDrinkCount: 0,
    requiresDogChoice: true,
  },
  "combo-dr-boneless": {
    sauceCount: 1,
    includedDrinkCount: 0,
    requiresDogChoice: true,
  },
  "alitas-boneless-pieza": { sauceCount: 1, includedDrinkCount: 0 },
  "sampler-madburguer": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 0,
    requiresDogChoice: true,
  },
  "charola-burguer": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 2,
    includedDrinkIds: [...INCLUDED_DRINK_TE_JAMAICA],
  },
  "charola-dogos": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 2,
    includedDrinkIds: [...INCLUDED_DRINK_TE_JAMAICA],
    requiresDogChoice: true,
    dogChoiceIds: [...CHAROLA_DOG_CHOICE_IDS],
  },
  "charola-sv": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 2,
    includedDrinkIds: [...INCLUDED_DRINK_TE_JAMAICA],
  },
  "charola-especial": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 2,
    includedDrinkIds: [...INCLUDED_DRINK_TE_JAMAICA],
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
    Boolean(rules.requiresBurgerChoice) ||
    Boolean(rules.requiresDogChoice)
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

export function requiresDogSelection(item: MenuItem): boolean {
  return Boolean(getCustomizationRules(item).requiresDogChoice);
}

export function burgersForChoice(allItems: MenuItem[]): MenuItem[] {
  return allItems.filter((i) => i.category === "hamburguesas");
}

export function dogChoiceIdsForItem(
  item: Pick<MenuItem, "_id">,
): readonly string[] {
  const rules = ITEM_CUSTOMIZATION_RULES[menuItemIdKey(item._id)];
  return rules?.dogChoiceIds?.length ? rules.dogChoiceIds : DOG_CHOICE_IDS;
}

export function dogsForChoice(
  allItems: MenuItem[],
  item?: Pick<MenuItem, "_id">,
): MenuItem[] {
  const orderedIds = item ? dogChoiceIdsForItem(item) : DOG_CHOICE_IDS;
  const allowed = new Set(orderedIds);
  const found = allItems.filter((i) => allowed.has(menuItemIdKey(i._id)));
  return orderedIds
    .map((id) => found.find((i) => menuItemIdKey(i._id) === id))
    .filter((i): i is MenuItem => Boolean(i));
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
