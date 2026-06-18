export type MenuCategory =
  | "hot-dogs"
  | "hamburguesas"
  | "alitas"
  | "boneless"
  | "papas"
  | "conos"
  | "charolas"
  | "combos"
  | "extras"
  | "bebidas";

export type MenuItem = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: MenuCategory;
  badge?: string;
  featured: boolean;
  order: number;
  imageUrl?: string;
};
