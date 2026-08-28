import type { MenuIngredient } from "@/lib/types";

function itemIdKey(id: string): string {
  return id.replace(/^menuItem\./, "");
}

const BURGER_STD_NO_BACON: MenuIngredient[] = [
  { name: "Lechuga", includedByDefault: true },
  { name: "Tomate", includedByDefault: true },
  { name: "Cebolla", includedByDefault: true },
  { name: "Queso", includedByDefault: true },
  { name: "Jamón", includedByDefault: true },
];

const HOT_DOG_WRAPPED: MenuIngredient[] = [
  { name: "Queso manchego", includedByDefault: true },
  { name: "Jamón de pavo", includedByDefault: true },
  { name: "Tocino", includedByDefault: true },
  { name: "Cebolla asada", includedByDefault: true },
];

/** Ingredientes por ID de producto (sin prefijo menuItem.). */
export const ITEM_INGREDIENTS: Record<string, MenuIngredient[]> = {
  "maddogo-especial": [
    { name: "Queso manchego", includedByDefault: true },
    { name: "Jamón de pavo", includedByDefault: true },
    { name: "Cebolla asada", includedByDefault: true },
  ],
  "easy-dog-especial": HOT_DOG_WRAPPED,
  "chilli-dog": HOT_DOG_WRAPPED,
  "perro-bacon": HOT_DOG_WRAPPED,
  "mad-burguer": BURGER_STD_NO_BACON,
  "madbon-burguer": BURGER_STD_NO_BACON,
  "mad-double-burguer": BURGER_STD_NO_BACON,
  "madburguer-hawaiana": BURGER_STD_NO_BACON,
  "smash-madburger": [
    { name: "Tocino", includedByDefault: true },
    { name: "Cebolla", includedByDefault: true },
    { name: "Queso americano", includedByDefault: true },
    { name: "Pepinillos", includedByDefault: true },
  ],
  "lowcarb-burguer": [
    { name: "Lechuga", includedByDefault: true },
    { name: "Tomate", includedByDefault: true },
    { name: "Cebolla", includedByDefault: true },
    { name: "Queso", includedByDefault: true },
    { name: "Jamón", includedByDefault: true },
    { name: "Guacamole", includedByDefault: true },
    { name: "Vegetales", includedByDefault: true },
  ],
  "lowcarb-double": [
    { name: "Lechuga", includedByDefault: true },
    { name: "Tomate", includedByDefault: true },
    { name: "Cebolla", includedByDefault: true },
    { name: "Queso", includedByDefault: true },
    { name: "Jamón", includedByDefault: true },
    { name: "Guacamole", includedByDefault: true },
    { name: "Vegetales", includedByDefault: true },
  ],
  "mad-cheese-burguer": BURGER_STD_NO_BACON,
  "mad-cheese-jalapeno": BURGER_STD_NO_BACON,
  "eyeye-madburger": BURGER_STD_NO_BACON,
  "madburguer-camaron": BURGER_STD_NO_BACON,
  "mad-west-burguer": [
    { name: "BBQ", includedByDefault: true },
    { name: "Jamón", includedByDefault: true },
    { name: "Queso", includedByDefault: true },
    { name: "Tocino", includedByDefault: true },
    { name: "4 aros de cebolla", includedByDefault: true },
  ],
  "in-n-out-burguer": [
    { name: "Lechuga", includedByDefault: true },
    { name: "Tomate", includedByDefault: true },
    { name: "Cebolla", includedByDefault: true },
    { name: "Queso americano", includedByDefault: true },
    { name: "Pepinillos", includedByDefault: true },
    { name: "Aderezo", includedByDefault: true },
  ],
};

export function resolveItemIngredients(
  item: Pick<MenuItemLike, "_id" | "category" | "name" | "ingredients">,
): MenuIngredient[] | undefined {
  const id = itemIdKey(item._id);
  if (ITEM_INGREDIENTS[id]) return ITEM_INGREDIENTS[id];
  if (item.ingredients?.length) return item.ingredients;
  if (item.category === "hamburguesas") return BURGER_STD_NO_BACON;
  if (item.category === "hot-dogs" && item.name !== "Easy Dog") return HOT_DOG_WRAPPED;
  return undefined;
}

type MenuItemLike = {
  _id: string;
  category: string;
  name: string;
  ingredients?: MenuIngredient[];
};
