import type { MenuCategory, MenuExtra, MenuItem } from "@/lib/types";
import { ITEM_INGREDIENTS } from "@/lib/item-ingredients";
import { itemIncludesPapas } from "@/lib/menu-descriptions";

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

/**
 * Upgrade de las papas incluidas. No se vende solo en el menú:
 * solo aparece al personalizar un platillo que ya trae papas.
 */
export const PAPAS_UPGRADE_EXTRA_ID = "extra-papas";

/** Papas que se agregan a platillos que no las traen. No se venden solas. */
export const PAPAS_FRANCESA_EXTRA_ID = "extra-francesa";
export const PAPAS_CURLY_EXTRA_ID = "extra-curly";

const PAPAS_SIDE_EXTRA_DEFS = [
  {
    id: PAPAS_FRANCESA_EXTRA_ID,
    name: "Papas a la Francesa",
    price: 15,
    imageFromId: "papas-francesa",
    description: "Agrega papas a la francesa a tu platillo",
  },
  {
    id: PAPAS_CURLY_EXTRA_ID,
    name: "Papas Curly",
    price: 15,
    imageFromId: "papas-curly",
    description: "Papas curly. En platillos con papas, cambia las incluidas.",
  },
] as const;

const MANAGED_FRY_EXTRA_IDS = new Set<string>([
  PAPAS_UPGRADE_EXTRA_ID,
  PAPAS_FRANCESA_EXTRA_ID,
  PAPAS_CURLY_EXTRA_ID,
]);

const PLAIN_FRIES_ITEM_IDS = new Set(["lowcarb-burguer", "lowcarb-double"]);

/** Todos los extras del menú — vinculados a hot dogs y hamburguesas */
export const ALL_EXTRA_IDS = [
  "extra-animal",
  "extra-chile",
  "extra-guacamole",
  "extra-gratinado",
  "extra-ranch",
  "extra-bbq",
  "extra-redhot",
  "extra-teriyaki",
  "extra-maddogos",
  "extra-nachos",
  "extra-mango",
  "extra-aro",
] as const;

/** Extras vinculables por categoría (IDs del seed/fallback) */
export const LINKED_EXTRA_IDS: Record<string, string[]> = {
  alitas: ["extra-gratinado", "extra-ranch", "extra-bbq"],
  boneless: ["extra-gratinado", "extra-ranch", "extra-bbq"],
  hamburguesas: [...ALL_EXTRA_IDS],
  "hot-dogs": [...ALL_EXTRA_IDS],
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
  },
  "sampler-maddogos": {
    sauceCount: 2,
    sauceLabels: ["Salsa alitas", "Salsa boneless"],
    includedDrinkCount: 0,
    requiresDogChoice: true,
  },
  "madbon-burguer": { sauceCount: 1, includedDrinkCount: 0 },
  "madcono-chico": { sauceCount: 1, includedDrinkCount: 0 },
  "madcono-grande": { sauceCount: 1, includedDrinkCount: 0 },
  "madcono-salvaje": { sauceCount: 1, includedDrinkCount: 0 },
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

function isManagedFryExtra(id: string): boolean {
  return MANAGED_FRY_EXTRA_IDS.has(menuItemIdKey(id));
}

/** Low carb, alitas y boneless no traen papas: se les puede agregar francesa o curly. */
export function itemCanAddPlainFries(item: {
  _id: string;
  category: MenuCategory;
  badge?: string;
}): boolean {
  if (itemIncludesPapas(item)) return false;
  if (item.category === "alitas" || item.category === "boneless") return true;
  return PLAIN_FRIES_ITEM_IDS.has(menuItemIdKey(item._id));
}

export function isHiddenFromMenu(id: string): boolean {
  return MANAGED_FRY_EXTRA_IDS.has(menuItemIdKey(id));
}

/** Francesa y curly son alternativas: elegir una quita la otra. */
export function opposingPlainFriesExtraId(id: string): string | undefined {
  const key = menuItemIdKey(id);
  if (key === PAPAS_FRANCESA_EXTRA_ID) return PAPAS_CURLY_EXTRA_ID;
  if (key === PAPAS_CURLY_EXTRA_ID) return PAPAS_FRANCESA_EXTRA_ID;
  return undefined;
}

export function ensurePapasSideExtras(items: MenuItem[]): MenuItem[] {
  const byId = new Map(items.map((item) => [menuItemIdKey(item._id), item]));
  const missing = PAPAS_SIDE_EXTRA_DEFS.filter((def) => !byId.has(def.id));
  if (!missing.length) return items;

  return [
    ...items,
    ...missing.map((def) => {
      const source = byId.get(def.imageFromId);
      const extra: MenuItem = {
        _id: def.id,
        name: def.name,
        slug: def.id,
        description: def.description,
        price: def.price,
        category: "extras",
        featured: false,
        order: 99,
        imageUrl: source?.imageUrl,
      };
      return extra;
    }),
  ];
}

function fryExtraFromCatalog(
  allItems: MenuItem[],
  id: string,
  fallback: { name: string; price: number },
): MenuExtra {
  const found = allItems.find((extra) => menuItemIdKey(extra._id) === id);
  return {
    _id: found?._id ?? id,
    name: fallback.name,
    price: fallback.price,
  };
}

export function resolveLinkedExtras(
  item: MenuItem,
  allItems: MenuItem[],
): MenuExtra[] {
  const base = item.linkedExtras?.length
    ? item.linkedExtras
    : extrasForCategory(item, allItems);

  const withoutFryExtras = base.filter((extra) => !isManagedFryExtra(extra._id));
  const fryExtras: MenuExtra[] = [];

  if (itemCanAddPlainFries(item)) {
    fryExtras.push(
      fryExtraFromCatalog(allItems, PAPAS_FRANCESA_EXTRA_ID, {
        name: "Papas a la Francesa",
        price: 15,
      }),
      fryExtraFromCatalog(allItems, PAPAS_CURLY_EXTRA_ID, {
        name: "Papas Curly",
        price: 15,
      }),
    );
  } else if (itemIncludesPapas(item)) {
    fryExtras.push(
      fryExtraFromCatalog(allItems, PAPAS_CURLY_EXTRA_ID, {
        name: "Papas Curly",
        price: 15,
      }),
    );
    const upgrade = allItems.find(
      (extra) => menuItemIdKey(extra._id) === PAPAS_UPGRADE_EXTRA_ID,
    );
    if (upgrade) {
      fryExtras.push({
        _id: upgrade._id,
        name: upgrade.name,
        price: upgrade.price,
      });
    }
  }

  return [...fryExtras, ...withoutFryExtras];
}

function extrasForCategory(item: MenuItem, allItems: MenuItem[]): MenuExtra[] {
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
  const key = id ? menuItemIdKey(id) : "";
  const rules = key ? ITEM_CUSTOMIZATION_RULES[key] : undefined;
  if (rules?.sauceCount && rules.sauceCount > 0) {
    if (category === "hamburguesas" && ITEM_INGREDIENTS[key]) return "ingredients";
    return "sauce";
  }
  if (category === "hamburguesas") return "ingredients";
  if (category === "hot-dogs" && name !== "Easy Dog") return "ingredients";
  if (category === "alitas" || category === "boneless" || category === "conos") {
    return rules?.sauceCount ? "sauce" : "none";
  }
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
