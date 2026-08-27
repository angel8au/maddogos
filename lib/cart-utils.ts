import type {
  CartLineItem,
  MenuItem,
  MenuIngredient,
  MenuCategory,
  SelectedBurger,
  SelectedDog,
  SelectedDrink,
  SelectedExtra,
  SelectedIngredient,
} from "@/lib/types";
import { getMenuImageUrl } from "@/lib/menu-images";
import { isValidMenuCategory } from "@/lib/cart-line-utils";
import { getCustomizationRules } from "@/lib/menu-config";

export function getDefaultIngredients(item: MenuItem): SelectedIngredient[] {
  if (!item.ingredients?.length) return [];
  return item.ingredients.map((ing) => ({
    name: ing.name,
    included: ing.includedByDefault,
  }));
}

export function configSignature(
  itemId: string,
  ingredients: SelectedIngredient[],
  specialInstructions?: string,
  selectedSauce?: string,
  selectedExtras: SelectedExtra[] = [],
  selectedSauces: string[] = [],
  selectedDrinks: SelectedDrink[] = [],
  selectedBurger?: SelectedBurger,
  selectedDog?: SelectedDog,
): string {
  const ingKey = ingredients
    .map((i) => `${i.name}:${i.included ? "1" : "0"}`)
    .sort()
    .join("|");
  const extrasKey = selectedExtras
    .filter((e) => e.quantity > 0)
    .map((e) => `${e.id}:${e.quantity}`)
    .sort()
    .join("|");
  const saucesKey = (selectedSauces.length ? selectedSauces : selectedSauce ? [selectedSauce] : [])
    .join("|");
  const drinksKey = selectedDrinks
    .filter((d) => d.quantity > 0)
    .map((d) => `${d.id}:${d.quantity}`)
    .sort()
    .join("|");
  return [
    itemId,
    ingKey,
    saucesKey,
    drinksKey,
    selectedBurger?.id ?? "",
    selectedDog?.id ?? "",
    extrasKey,
    specialInstructions?.trim() ?? "",
  ].join("::");
}

export function lineUnitPrice(line: CartLineItem): number {
  const extrasTotal = line.selectedExtras.reduce(
    (sum, extra) => sum + extra.price * extra.quantity,
    0,
  );
  return line.basePrice + extrasTotal;
}

export function lineSubtotal(line: CartLineItem): number {
  return lineUnitPrice(line) * line.quantity;
}

export function cartTotal(lines: CartLineItem[]): number {
  return lines.reduce((sum, line) => sum + lineSubtotal(line), 0);
}

export function cartItemCount(lines: CartLineItem[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function formatIngredientsForDisplay(
  ingredients: SelectedIngredient[],
): string {
  if (!ingredients.length) return "";
  const included = ingredients.filter((i) => i.included).map((i) => i.name);
  const excluded = ingredients.filter((i) => !i.included).map((i) => i.name);
  const parts: string[] = [];
  if (included.length) parts.push(`Con: ${included.join(", ")}`);
  if (excluded.length) parts.push(`Sin: ${excluded.join(", ")}`);
  return parts.join(" · ");
}

export function formatExtrasForDisplay(extras: SelectedExtra[]): string {
  const active = extras.filter((e) => e.quantity > 0);
  if (!active.length) return "";
  return active
    .map((e) =>
      e.quantity > 1
        ? `${e.name} x${e.quantity} (+${formatMXNInline(e.price * e.quantity)})`
        : `${e.name} (+${formatMXNInline(e.price)})`,
    )
    .join(", ");
}

export function formatSaucesForDisplay(
  line: Pick<CartLineItem, "selectedSauce" | "selectedSauces">,
  labels?: string[],
): string {
  const sauces =
    line.selectedSauces?.filter(Boolean) ??
    (line.selectedSauce ? [line.selectedSauce] : []);
  if (!sauces.length) return "";
  if (labels?.length && sauces.length > 1) {
    return sauces
      .map((sauce, i) => `${labels[i] ?? `Salsa ${i + 1}`}: ${sauce}`)
      .join(" · ");
  }
  if (sauces.length === 1) return `Salsa: ${sauces[0]}`;
  return `Salsas: ${sauces.join(", ")}`;
}

export function formatDrinksForDisplay(drinks?: SelectedDrink[]): string {
  const active = drinks?.filter((d) => d.quantity > 0) ?? [];
  if (!active.length) return "";
  return active
    .map((d) => (d.quantity > 1 ? `${d.name} x${d.quantity}` : d.name))
    .join(", ");
}

function formatMXNInline(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function validateCartAdd(
  item: MenuItem,
  selectedSauce?: string,
  selectedSauces: string[] = [],
  selectedDrinks: SelectedDrink[] = [],
  selectedBurger?: SelectedBurger,
  selectedDog?: SelectedDog,
): string | null {
  const rules = getCustomizationRules(item);
  const sauces =
    selectedSauces.filter(Boolean).length > 0
      ? selectedSauces.filter(Boolean)
      : selectedSauce
        ? [selectedSauce]
        : [];

  if (rules.requiresDogChoice && !selectedDog?.id) {
    return "Selecciona tu hot dog";
  }

  if (rules.requiresBurgerChoice && !selectedBurger?.id) {
    return "Selecciona tu hamburguesa";
  }

  if (rules.sauceCount > 0 && sauces.length < rules.sauceCount) {
    return rules.sauceCount > 1
      ? "Selecciona salsa para alitas y boneless"
      : "Selecciona salsa para continuar";
  }

  if (rules.includedDrinkCount > 0) {
    const drinkTotal = selectedDrinks.reduce((sum, d) => sum + d.quantity, 0);
    if (drinkTotal < rules.includedDrinkCount) {
      return rules.includedDrinkCount === 1
        ? "Selecciona tu bebida incluida"
        : `Selecciona ${rules.includedDrinkCount} bebidas incluidas`;
    }
  }

  return null;
}

export const burgerIngredients: MenuIngredient[] = [
  { name: "Lechuga", includedByDefault: true },
  { name: "Tomate", includedByDefault: true },
  { name: "Cebolla", includedByDefault: true },
  { name: "Queso", includedByDefault: true },
  { name: "Jamón", includedByDefault: true },
  { name: "Tocino", includedByDefault: true },
  { name: "Salsa", includedByDefault: true },
];

export const hotDogIngredients: MenuIngredient[] = [
  { name: "Queso manchego", includedByDefault: true },
  { name: "Jamón de pavo", includedByDefault: true },
  { name: "Tocino", includedByDefault: true },
  { name: "Cebolla asada", includedByDefault: true },
];

export function ingredientsForFallbackItem(
  category: MenuItem["category"],
  name: string,
): MenuIngredient[] | undefined {
  if (category === "hamburguesas") return burgerIngredients;
  if (category === "hot-dogs" && name !== "Easy Dog") return hotDogIngredients;
  return undefined;
}

export const CART_ORDER_STORAGE_KEY = "maddogos_cart_order";
export const CART_STORAGE_KEY = "maddogos_cart";
export const CART_CLEARED_EVENT = "maddogos:cart-cleared";

function normalizeCartLine(line: CartLineItem): CartLineItem {
  const category: MenuCategory = isValidMenuCategory(line.category)
    ? line.category
    : "hot-dogs";
  const slug = line.slug ?? line.itemId;

  return {
    ...line,
    category,
    slug,
    imageUrl: line.imageUrl ?? getMenuImageUrl(category, slug),
    selectedIngredients: line.selectedIngredients ?? [],
    selectedExtras: line.selectedExtras ?? [],
    selectedSauces: line.selectedSauces ?? (line.selectedSauce ? [line.selectedSauce] : []),
    selectedDrinks: line.selectedDrinks ?? [],
  };
}

export function loadCartFromStorage(): CartLineItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CartLineItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((line) => line?.lineId && line?.itemId && line?.name && line.quantity > 0)
      .map(normalizeCartLine);
  } catch {
    return [];
  }
}

export function saveCartToStorage(lines: CartLineItem[]): void {
  if (typeof window === "undefined") return;

  if (!lines.length) {
    localStorage.removeItem(CART_STORAGE_KEY);
    return;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
}

export function clearCartStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CART_CLEARED_EVENT));
}
