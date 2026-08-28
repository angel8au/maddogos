import type { MenuCategory, MenuItem } from "@/lib/types";
import { resolveItemIngredients } from "@/lib/item-ingredients";
import {
  customizationTypeForFallback,
  includedDrinkCountForFallback,
  sauceRequiredForFallback,
} from "@/lib/menu-config";
import { getMenuImageUrl } from "@/lib/menu-images";

type SeedItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  badge?: string;
  featured?: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const items: SeedItem[] = [
  // Promociones (temporales — desactivar con available: false en Sanity)
  {
    id: "combo-maddogos",
    name: "Combo Maddogos",
    description: "1 Mad Burguer + 1 Easy Dog Especial + 1 orden de papas.",
    price: 200,
    category: "promociones",
    badge: "Promo",
  },
  {
    id: "promo-2-madburguer-papas",
    name: "Combo MadBurguer",
    description: "2 Mad Burguer + 1 orden de papas.",
    price: 250,
    category: "promociones",
    badge: "Promo",
  },
  {
    id: "combo-dr",
    name: "Combo DR + Bebida",
    description:
      "1 Easy Dog o Easy Dog Especial + 5 alitas o boneless + 1 bebida (Té o Jamaica).",
    price: 170,
    category: "promociones",
    badge: "Promo",
  },
  {
    id: "combo-mad",
    name: "Combo Mad",
    description: "2 hamburguesas + 2 hot dogs + 2 órdenes de papas.",
    price: 400,
    category: "promociones",
    badge: "Promo",
  },
  {
    id: "sampler-madburguer",
    name: "Sampler MadBurger",
    description: "5 alitas + 5 boneless + 4 aros de cebolla.",
    price: 299,
    category: "promociones",
    badge: "Promo",
  },
  {
    id: "sampler-maddogos",
    name: "Sampler MadDogos",
    description:
      "2 Easy Dog o Easy Dog Especial + 5 alitas + 5 boneless + 4 aros de cebolla.",
    price: 299,
    category: "promociones",
    badge: "Promo",
  },
  {
    id: "alitas-boneless-pieza",
    name: "Alitas o Boneless",
    description: "Agrega a tu pedido. $10 por pieza. Sin vegetales · incluye 1 ranch.",
    price: 10,
    category: "promociones",
    badge: "Promo",
  },

  // Hot Dogs
  { id: "easy-dog", name: "Easy Dog", description: "Salchicha de pavo con tocino", price: 70, category: "hot-dogs" },
  { id: "easy-dog-especial", name: "Easy Dog Especial", description: "Easy Dog envuelto en queso manchego y jamón de pavo", price: 80, category: "hot-dogs" },
  { id: "chilli-dog", name: "Chilli Dog", description: "Salchicha de puerco con queso y chile jalapeño, envuelto en queso manchego y jamón de pavo", price: 95, category: "hot-dogs" },
  { id: "perro-bacon", name: "Perro Bacon", description: "Salchicha de puerco con queso y tocino, envuelto en queso manchego y jamón de pavo", price: 95, category: "hot-dogs" },
  { id: "maddogo-especial", name: "Maddogo Especial", description: "Salchicha de mezcla especial de carne de res y tocino, envuelta en tocino, queso manchego, jamón de pavo y cebolla asada", price: 100, category: "hot-dogs" },

  // Hamburguesas
  { id: "mad-burguer", name: "Mad Burguer", description: "Mezcla especial de carne con salsa, queso gouda, jamón, lechuga, tomate y cebolla", price: 155, category: "hamburguesas" },
  { id: "madbon-burguer", name: "MadBon Burguer", description: "Boneless bañados en salsa con queso gouda, jamón, lechuga, tomate y cebolla", price: 155, category: "hamburguesas" },
  { id: "mad-double-burguer", name: "MadDouble Burguer", description: "Mezcla especial doble con salsa, queso gouda, jamón, lechuga, tomate y cebolla", price: 185, category: "hamburguesas" },
  { id: "madburguer-hawaiana", name: "MadBurguer Hawaiana", description: "Carne y tocino con salsa, piña, guacamole, queso manchego, jamón, lechuga, tomate y cebolla asada", price: 185, category: "hamburguesas" },
  { id: "madburguer-camaron", name: "MadBurguer Camarón", description: "Camarones asados al pastor en costra de queso, lechuga, tomate, cebolla asada, pan brioche, aderezo chipotle spicy", price: 180, category: "hamburguesas" },
  { id: "smash-madburger", name: "Smash MadBurger", description: "Doble carne 200gr estilo smash, queso americano, tocino, cebolla y pepinillos en pan brioche", price: 180, category: "hamburguesas" },
  { id: "lowcarb-burguer", name: "LowCarb Burguer", description: "Sin papas. Lechuga romana con carne y tocino, queso manchego, jamón, lechuga, tomate, cebolla asada, vegetales y guacamole", price: 155, category: "hamburguesas", badge: "Sin papas" },
  { id: "lowcarb-double", name: "LowCarb Double Burguer", description: "Sin papas. LowCarb con doble carne, doble queso, doble jamón, vegetales y guacamole", price: 185, category: "hamburguesas", badge: "Sin papas" },
  { id: "mad-cheese-burguer", name: "Mad Cheese Burguer", description: "200gr carne rellena de queso americano, jamón, tocino, lechuga, tomate y cebolla", price: 185, category: "hamburguesas" },
  { id: "mad-cheese-jalapeno", name: "MadCheese Jalapeño", description: "Mezcla de quesos con un chile asado, en pan brioche", price: 185, category: "hamburguesas", badge: "Nuevo" },
  { id: "eyeye-madburger", name: "Eyeyé MadBurger", description: "Carne y chile anaheim gratinado con tocino y guacamole, en pan brioche", price: 185, category: "hamburguesas", badge: "Nuevo" },
  { id: "mad-west-burguer", name: "Mad West Burguer", description: "Carne y tocino con BBQ, queso manchego, jamón, 4 aros de cebolla, tocino frito en BBQ", price: 185, category: "hamburguesas" },
  { id: "in-n-out-burguer", name: "IN-N-OUT Burguer", description: "Pan brioche, mayonesa, lechuga romana, carne, queso americano, tomate, cebolla cruda, pepinillos, aderezo style", price: 180, category: "hamburguesas" },

  // Alitas
  { id: "orden-alitas", name: "Orden de Alitas", description: "10 pzas con salsa de elección y vegetales", price: 155, category: "alitas" },
  { id: "alitas-especiales", name: "Orden de Alitas Especiales", description: "Orden de alitas con papas gratinadas", price: 175, category: "alitas" },
  { id: "alitas-salvajes", name: "Alitas Salvajes", description: "10 pzas con papas salvajes", price: 195, category: "alitas" },

  // Boneless
  { id: "orden-boneless", name: "Orden de Boneless", description: "10 pzas con salsa de elección y vegetales", price: 155, category: "boneless" },
  { id: "boneless-especiales", name: "Orden de Boneless Especiales", description: "Boneless con papas gratinadas", price: 175, category: "boneless" },
  { id: "boneless-salvajes", name: "Boneless Salvajes", description: "10 pzas con papas salvajes", price: 195, category: "boneless" },

  // Papas
  { id: "papas-francesa", name: "Papas a la Francesa", description: "Papas naturales a la francesa", price: 80, category: "papas" },
  { id: "papas-curly", name: "Papas Curly Lemonpepper", description: "Papas curly con pimienta y limón", price: 80, category: "papas" },
  { id: "papas-animal", name: "Orden de Papas Animal Fries", description: "Papas con queso manchego, tocino frito y aderezo IN-N-OUT", price: 100, category: "papas" },
  { id: "papas-salvajes", name: "Papas Salvajes", description: "Papas con jamón de pavo, queso manchego y salchicha de jalapeño", price: 100, category: "papas" },
  { id: "aros-cebolla", name: "Orden de Aros de Cebolla", description: "8 aros de cebolla con papas a la francesa", price: 110, category: "papas" },

  // Conos
  { id: "madcono-chico", name: "MadCono Chico", description: "Media orden de boneless en papas curly lemonpepper, queso de nachos y ranch", price: 125, category: "conos" },
  { id: "madcono-grande", name: "MadCono Grande", description: "Orden de boneless en papas curly lemonpepper, queso de nachos y ranch", price: 175, category: "conos" },
  { id: "madcono-salvaje", name: "MadCono Salvaje", description: "Orden de boneless en papas curly lemonpepper, queso de nachos, ranch y topping de papas salvajes", price: 200, category: "conos" },

  // Charolas
  { id: "charola-burguer", name: "Charola MadCombo Burguer", description: "1 MadBurguer, alitas, boneless, vegetales, papas y 2 bebidas (Té o Jamaica)", price: 450, category: "charolas" },
  { id: "charola-dogos", name: "Charola MadCombo Dogos", description: "2 hot dogs (Easy Dog, Easy Especial, Chilli Dog o Perro Bacon), alitas, boneless, vegetales, papas y 2 bebidas (Té o Jamaica)", price: 450, category: "charolas" },
  { id: "charola-sv", name: "Charola SV", description: "2 MadBurguer, 5 alitas, 5 boneless, 4 aros de cebolla y 2 bebidas (Té o Jamaica)", price: 450, category: "charolas" },
  { id: "charola-especial", name: "Charola Especial MadDogos", description: "1 hamburguesa a elección, alitas, boneless, vegetales, papas y 2 bebidas (Té o Jamaica)", price: 480, category: "charolas" },

  // Combos
  { id: "combo-dr-alitas", name: "Combo Dr Alitas", description: "1 Easy Dog o Easy Dog Especial + papas + ½ orden de alitas", price: 160, category: "combos" },
  { id: "combo-dr-boneless", name: "Combo Dr Boneless", description: "1 Easy Dog o Easy Dog Especial + papas + ½ orden de boneless", price: 160, category: "combos" },
  { id: "combo-2-bacon", name: "Combo 2 Perro Bacon", description: "2 Perro Bacon (sin papas)", price: 160, category: "combos" },
  { id: "combo-2-chilli", name: "Combo 2 Chilli Dog", description: "2 Chilli Dog (sin papas)", price: 160, category: "combos" },
  { id: "combo-bacon-chilli", name: "Combo Perro Bacon + Chilli Dog", description: "1 Perro Bacon + 1 Chilli Dog (sin papas)", price: 160, category: "combos" },
  { id: "combo-3-easy", name: "Combo 3 Easy Dog", description: "3 Easy Dog (sin papas)", price: 160, category: "combos" },

  // Extras
  { id: "extra-animal", name: "Aderezo Animal Style", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-chile", name: "Chile Amarillo 3 pzas", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-guacamole", name: "Guacamole 2 oz", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-gratinado", name: "Gratinado de Papas", description: "Extra para acompañar tu orden", price: 25, category: "extras" },
  { id: "extra-ranch", name: "Aderezo Ranch", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-bbq", name: "Salsa BBQ", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-redhot", name: "Salsa Red Hot", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-teriyaki", name: "Salsa Teriyaki", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-maddogos", name: "MadDogos Sauce", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-nachos", name: "Queso de Nachos", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-mango", name: "Salsa Mango Habanero", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-aro", name: "Aro de Cebolla 1 pza", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-papas", name: "Papas Salvajes o Animal Style", description: "Extra para acompañar tu orden", price: 65, category: "extras" },

  // Bebidas
  { id: "bebida-jazmin", name: "Té", description: "Agua fresca 500ml", price: 25, category: "bebidas" },
  { id: "bebida-coca-500", name: "Coca-Cola 500ml", description: "Refresco 500ml", price: 25, category: "bebidas" },
  { id: "bebida-coca-600", name: "Coca-Cola 600ml", description: "Refresco 600ml", price: 30, category: "bebidas" },
  { id: "bebida-tonicol", name: "Tonicol 600ml", description: "Refresco 600ml", price: 30, category: "bebidas" },
  { id: "bebida-jamaica", name: "Jamaica", description: "Agua fresca 500ml", price: 25, category: "bebidas" },
  { id: "bebida-hielo", name: "Vaso con Hielo", description: "Vaso con hielo", price: 5, category: "bebidas" },
];

const orderByCategory = new Map<MenuCategory, number>();

export const categoryLabels: Record<MenuCategory, string> = {
  promociones: "Promociones",
  "hot-dogs": "Hot Dogs",
  hamburguesas: "Hamburguesas",
  alitas: "Alitas",
  boneless: "Boneless",
  papas: "Papas y Entradas",
  conos: "Conos",
  charolas: "Charolas",
  combos: "Combos",
  extras: "Extras",
  bebidas: "Bebidas",
};

export const categoryOrder: MenuCategory[] = [
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
  "promociones",
];

export const menuSeed = items.map((item) => {
  const order = (orderByCategory.get(item.category) ?? 0) + 1;
  orderByCategory.set(item.category, order);
  return { ...item, order };
});

export const fallbackMenuItems: MenuItem[] = menuSeed.map((item) => {
  const slug = slugify(item.name);
  return {
    _id: item.id,
    name: item.name,
    slug,
    description: item.description,
    price: item.price,
    category: item.category,
    badge: item.badge,
    featured: item.featured ?? false,
    order: item.order,
    imageUrl: getMenuImageUrl(item.category, slug),
    customizationType: customizationTypeForFallback(item.category, item.name, item.id),
    sauceRequired: sauceRequiredForFallback(item.category, item.id),
    includedDrinkCount: includedDrinkCountForFallback(item.id),
    ingredients: resolveItemIngredients({
      _id: item.id,
      category: item.category,
      name: item.name,
    }),
  };
});
