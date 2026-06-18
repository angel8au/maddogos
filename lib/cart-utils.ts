import type {
  CartLineItem,
  MenuItem,
  MenuIngredient,
  MenuCategory,
  SelectedExtra,
  SelectedIngredient,
} from "@/lib/types";
import { getMenuImageUrl } from "@/lib/menu-images";
import { isValidMenuCategory } from "@/lib/cart-line-utils";
import { requiresSauceSelection } from "@/lib/menu-config";

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
  return [
    itemId,
    ingKey,
    selectedSauce ?? "",
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
): string | null {
  if (requiresSauceSelection(item) && !selectedSauce) {
    return "Selecciona salsa para continuar";
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
