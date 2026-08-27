export type MenuCategory =
  | "promociones"
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

export type CustomizationType = "none" | "ingredients" | "sauce" | "extras";

export type MenuIngredient = {
  name: string;
  includedByDefault: boolean;
};

export type MenuExtra = {
  _id: string;
  name: string;
  price: number;
};

export type SelectedDrink = {
  id: string;
  name: string;
  quantity: number;
};

export type SelectedBurger = {
  id: string;
  name: string;
};

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
  customizationType?: CustomizationType;
  sauceRequired?: boolean;
  /** Bebidas incluidas en el precio (obligatorias). 0 = no aplica. */
  includedDrinkCount?: number;
  ingredients?: MenuIngredient[];
  linkedExtras?: MenuExtra[];
};

export type SelectedIngredient = {
  name: string;
  included: boolean;
};

export type SelectedExtra = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type CartLineItem = {
  lineId: string;
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  imageUrl: string;
  category: MenuCategory;
  slug: string;
  description?: string;
  sauceRequired?: boolean;
  includedDrinkCount?: number;
  customizationType?: CustomizationType;
  ingredients?: MenuIngredient[];
  selectedIngredients: SelectedIngredient[];
  /** Salsa única (compat) o primera de selectedSauces */
  selectedSauce?: string;
  /** Una o más salsas (ej. alitas + boneless) */
  selectedSauces?: string[];
  selectedDrinks?: SelectedDrink[];
  selectedBurger?: SelectedBurger;
  selectedExtras: SelectedExtra[];
  specialInstructions?: string;
};

export type SiteConfig = {
  whatsappNumber?: string;
  whatsappMessage?: string;
  address?: string;
  deliveryZone?: string;
  openingHours?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  sauceOptions: string[];
};
