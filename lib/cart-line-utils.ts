import { getMenuImageUrl } from "@/lib/menu-images";
import type { CartLineItem, MenuCategory, MenuItem } from "@/lib/types";

export function cartLineToMenuItem(
  line: CartLineItem,
  catalog: MenuItem[],
): MenuItem {
  const fromCatalog = catalog.find((item) => item._id === line.itemId);
  if (fromCatalog) return fromCatalog;

  const category = line.category ?? "hot-dogs";

  return {
    _id: line.itemId,
    name: line.name,
    slug: line.slug ?? line.itemId,
    description: line.description ?? "",
    price: line.basePrice,
    category,
    featured: false,
    order: 0,
    imageUrl: line.imageUrl ?? getMenuImageUrl(category, line.slug),
    customizationType: line.customizationType,
    sauceRequired: line.sauceRequired,
    ingredients: line.ingredients,
  };
}

export function isValidMenuCategory(value: unknown): value is MenuCategory {
  return (
    typeof value === "string" &&
    [
      "hot-dogs",
      "hamburguesas",
      "alitas",
      "boneless",
      "papas",
      "conos",
      "charolas",
      "combos",
      "extras",
      "bebidas",
    ].includes(value)
  );
}
