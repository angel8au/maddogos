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
  customizationType?: CustomizationType;
  ingredients?: MenuIngredient[];
  selectedIngredients: SelectedIngredient[];
  selectedSauce?: string;
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
